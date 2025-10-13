import { PrismaClient, Idea, AgentType } from "@prisma/client";
import { AgentService } from "./agent.service";
import { PromptBuilder } from "../integrations/gemini/prompts";
import { logger } from "../utils/logger";
import { CreativeBrief } from "../types/session.types";

export class IdeaService {
  private prisma: PrismaClient;
  private agentService: AgentService;

  constructor(prisma: PrismaClient, agentService: AgentService) {
    this.prisma = prisma;
    this.agentService = agentService;
  }

  async generateIdeas(
    sessionId: string,
    creativeBrief: CreativeBrief,
    apiKey: string,
  ): Promise<Idea[]> {
    try {
      logger.info("Starting idea generation", { sessionId });

      // Get Story Architect agent for primary idea generation
      const storyArchitectAgent = await this.prisma.agent.findFirst({
        where: {
          sessionId,
          agentType: "story_architect",
          isActive: true,
        },
      });

      if (!storyArchitectAgent) {
        throw new Error("Story Architect agent not found");
      }

      // Generate primary ideas using Story Architect
      const ideaGenerationPrompt =
        PromptBuilder.buildIdeaGenerationPrompt(creativeBrief);

      const storyArchitectResult = await this.agentService.executeAgent(
        storyArchitectAgent.id,
        "idea_generation",
        { creativeBrief },
        apiKey,
      );

      if (!storyArchitectResult.success) {
        throw new Error("Story Architect idea generation failed");
      }

      // Parse the generated ideas from the response
      const ideas = await this.parseGeneratedIdeas(
        sessionId,
        storyArchitectResult.response,
        creativeBrief,
      );

      // Enhance each idea with Character Development agent
      const enhancedIdeas = await this.enhanceIdeasWithCharacterDevelopment(
        ideas,
        sessionId,
        apiKey,
      );

      logger.info("Idea generation completed", {
        sessionId,
        ideaCount: enhancedIdeas.length,
      });

      return enhancedIdeas;
    } catch (error) {
      logger.error("Idea generation failed", { error, sessionId });
      throw error;
    }
  }

  private async parseGeneratedIdeas(
    sessionId: string,
    response: string,
    creativeBrief: CreativeBrief,
  ): Promise<Idea[]> {
    const ideas: Idea[] = [];

    try {
      // Parse the response to extract two ideas
      const ideaSections = this.extractIdeaSections(response);

      for (let i = 0; i < Math.min(ideaSections.length, 2); i++) {
        const ideaSection = ideaSections[i];
        const ideaData = this.parseIdeaSection(ideaSection, creativeBrief);

        const idea = await this.prisma.idea.create({
          data: {
            sessionId,
            title: ideaData.title,
            content: ideaData.content,
            genre: creativeBrief.genre,
            themes: ideaData.themes,
            characters: ideaData.characters,
            structure: ideaData.structure,
            setting: ideaData.setting,
            status: "generated",
            metadata: {
              source: "story_architect",
              generationMethod: "ai_generated",
              originalResponse: ideaSection,
            },
          },
        });

        ideas.push(idea);
      }

      logger.info("Parsed generated ideas", {
        sessionId,
        parsedCount: ideas.length,
      });

      return ideas;
    } catch (error) {
      logger.error("Failed to parse generated ideas", { error, sessionId });
      throw error;
    }
  }

  private extractIdeaSections(response: string): string[] {
    const sections: string[] = [];

    // Look for idea markers in Arabic or English
    const ideaMarkers = [
      /### الفكرة الأولى:/g,
      /### الفكرة الثانية:/g,
      /### Idea 1:/g,
      /### Idea 2:/g,
      /## الفكرة الأولى:/g,
      /## الفكرة الثانية:/g,
      /## Idea 1:/g,
      /## Idea 2:/g,
    ];

    let lastIndex = 0;
    for (const marker of ideaMarkers) {
      const matches = [...response.matchAll(marker)];
      for (const match of matches) {
        if (match.index !== undefined && match.index > lastIndex) {
          const startIndex = match.index + match[0].length;
          const nextMarker = this.findNextMarker(
            response,
            startIndex,
            ideaMarkers,
          );
          const endIndex = nextMarker || response.length;

          sections.push(response.substring(startIndex, endIndex).trim());
          lastIndex = endIndex;
        }
      }
    }

    // If no markers found, try to split by common separators
    if (sections.length === 0) {
      const separators = ["\n\n###", "\n\n##", "\n\n---", "\n\n***"];
      for (const separator of separators) {
        if (response.includes(separator)) {
          const parts = response.split(separator).slice(1); // Skip first part
          sections.push(...parts.slice(0, 2)); // Take first two parts
          break;
        }
      }
    }

    // Fallback: split into two equal parts
    if (sections.length === 0) {
      const midPoint = Math.floor(response.length / 2);
      sections.push(response.substring(0, midPoint));
      sections.push(response.substring(midPoint));
    }

    return sections.slice(0, 2); // Ensure we only have 2 ideas max
  }

  private findNextMarker(
    text: string,
    startIndex: number,
    markers: RegExp[],
  ): number | null {
    let nextIndex = text.length;

    for (const marker of markers) {
      marker.lastIndex = startIndex;
      const match = marker.exec(text);
      if (match && match.index < nextIndex) {
        nextIndex = match.index;
      }
    }

    return nextIndex < text.length ? nextIndex : null;
  }

  private parseIdeaSection(section: string, creativeBrief: CreativeBrief): any {
    // Extract title
    const titleMatch = section.match(/(?:العنوان|Title)[:\s]*(.+?)(?:\n|$)/i);
    const title = titleMatch
      ? titleMatch[1].trim()
      : `فكرة مبتكرة في ${creativeBrief.genre}`;

    // Extract themes
    const themesMatch = section.match(
      /(?:المواضيع|Themes)[:\s]*(.+?)(?:\n|$)/i,
    );
    const themes = themesMatch
      ? themesMatch[1]
          .split(/[,،]/)
          .map((t) => t.trim())
          .filter((t) => t)
      : creativeBrief.themes;

    // Extract characters
    const charactersMatch = section.match(
      /(?:الشخصيات|Characters)[:\s]*([\s\S]+?)(?:\n\n|\n###|\n##|$)/i,
    );
    const characters = charactersMatch
      ? this.parseCharacters(charactersMatch[1])
      : [];

    // Extract structure
    const structureMatch = section.match(
      /(?:البنية|Structure)[:\s]*([\s\S]+?)(?:\n\n|\n###|\n##|$)/i,
    );
    const structure = structureMatch ? structureMatch[1].trim() : "";

    // Extract setting
    const settingMatch = section.match(
      /(?:الإعداد|Setting)[:\s]*([\s\S]+?)(?:\n\n|\n###|\n##|$)/i,
    );
    const setting = settingMatch ? settingMatch[1].trim() : "";

    // Use the full section as content if no specific content section found
    const contentMatch = section.match(
      /(?:المحتوى|Content)[:\s]*([\s\S]+?)(?:\n\n|\n###|\n##|$)/i,
    );
    const content = contentMatch ? contentMatch[1].trim() : section;

    return {
      title,
      content,
      themes,
      characters,
      structure,
      setting,
    };
  }

  private parseCharacters(charactersText: string): any[] {
    const characters: any[] = [];
    const lines = charactersText.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Simple character parsing - can be enhanced
        characters.push({
          name: trimmedLine,
          description: "",
          role: "supporting",
        });
      }
    }

    return characters;
  }

  private async enhanceIdeasWithCharacterDevelopment(
    ideas: Idea[],
    sessionId: string,
    apiKey: string,
  ): Promise<Idea[]> {
    try {
      const characterDevelopmentAgent = await this.prisma.agent.findFirst({
        where: {
          sessionId,
          agentType: "character_development",
          isActive: true,
        },
      });

      if (!characterDevelopmentAgent) {
        logger.warn(
          "Character Development agent not found, skipping enhancement",
        );
        return ideas;
      }

      const enhancedIdeas: Idea[] = [];

      for (const idea of ideas) {
        const enhancementResult = await this.agentService.executeAgent(
          characterDevelopmentAgent.id,
          "character_enhancement",
          { idea },
          apiKey,
        );

        if (enhancementResult.success) {
          // Parse character enhancements from the response
          const enhancedCharacters = this.parseCharacterEnhancements(
            enhancementResult.response,
            idea.characters as any[],
          );

          // Update the idea with enhanced characters
          const enhancedIdea = await this.prisma.idea.update({
            where: { id: idea.id },
            data: {
              characters: enhancedCharacters,
              metadata: {
                ...(idea.metadata as any),
                characterEnhanced: true,
                characterEnhancementResponse: enhancementResult.response,
              },
            },
          });

          enhancedIdeas.push(enhancedIdea);
        } else {
          logger.warn("Character enhancement failed for idea", {
            ideaId: idea.id,
            error: enhancementResult.error,
          });
          enhancedIdeas.push(idea);
        }
      }

      logger.info("Character enhancement completed", {
        sessionId,
        enhancedCount: enhancedIdeas.length,
      });

      return enhancedIdeas;
    } catch (error) {
      logger.error("Character enhancement failed", { error, sessionId });
      return ideas; // Return original ideas if enhancement fails
    }
  }

  private parseCharacterEnhancements(
    response: string,
    originalCharacters: any[],
  ): any[] {
    try {
      // Enhanced character parsing logic
      // This is a simplified version - can be made more sophisticated
      const enhancedCharacters = [...originalCharacters];

      // Look for character descriptions in the response
      const characterSections = response.split(/\n(?=[A-Z\u0600-\u06FF])/g);

      for (const section of characterSections) {
        const lines = section.trim().split("\n");
        if (lines.length >= 2) {
          const name = lines[0].trim();
          const description = lines.slice(1).join(" ").trim();

          // Find matching character and enhance
          const characterIndex = enhancedCharacters.findIndex(
            (char) => char.name.includes(name) || name.includes(char.name),
          );

          if (characterIndex !== -1) {
            enhancedCharacters[characterIndex].description = description;
            enhancedCharacters[characterIndex].enhanced = true;
          }
        }
      }

      return enhancedCharacters;
    } catch (error) {
      logger.error("Failed to parse character enhancements", { error });
      return originalCharacters;
    }
  }

  async getIdeasBySession(sessionId: string): Promise<Idea[]> {
    return await this.prisma.idea.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
  }

  async getIdeaById(ideaId: string): Promise<Idea | null> {
    return await this.prisma.idea.findUnique({
      where: { id: ideaId },
    });
  }

  async updateIdeaStatus(ideaId: string, status: string): Promise<void> {
    await this.prisma.idea.update({
      where: { id: ideaId },
      data: { status },
    });

    logger.info("Updated idea status", { ideaId, status });
  }
}
