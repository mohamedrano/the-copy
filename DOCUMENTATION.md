# Arabic Screenplay Editor - Enhanced Version Documentation

## Introduction
This enhanced version of the Arabic Screenplay Editor has been specifically improved to handle the complex structures found in Arabic screenplays. The enhancements address the specific issues identified in the JSON data structure provided by the user.

## Key Features

### Enhanced Scene Header Processing
The editor now properly handles complex scene headers with multiple components:

1. **Primary Scene Header**: "مشهد 1"
2. **Secondary Scene Header**: "ليل-داخلي" 
3. **Tertiary Scene Header**: "قصر المُشتكي – غرفة الكهف"

### Improved Character Line Recognition
Character lines are now correctly identified, especially those ending with colons:
- "ليليث:"
- "المُشتكي:"
- "الطبيب :"

### Better Action Line Classification
Action lines that were previously misclassified are now properly formatted:
- "تبتسم هند رغم الامها"
- "يقف منصف امام ماجدة"
- "يلتفت نصفة و ينظر الى الباب"

### Leading Dash Removal
Action lines with leading dashes (common in some screenplay formats) are automatically cleaned:
- "- يكتب على الشاشة قبل الاف السنين من الميلاد" becomes "يكتب على الشاشة قبل الاف السنين من الميلاد"

## Technical Enhancements

### 1. Expanded Action Verb Database
The editor now recognizes 60+ Arabic action verbs, allowing for more accurate classification of action lines vs. character lines.

### 2. Enhanced Pattern Matching
Improved regex patterns for:
- Scene headers with complex time/location information
- Character names with Arabic text structures
- Action lines with descriptive content

### 3. Context-Aware Processing
The editor now uses context tracking to better understand screenplay structure:
- Maintains dialogue block context
- Tracks previous line formats
- Uses contextual clues for classification
- **NEW**: Post-processes formatted content to correct misclassifications by analyzing groups of lines together

## Usage Instructions

### Basic Operation
1. Open the editor in your browser (http://localhost:5174)
2. Type or paste your Arabic screenplay text
3. The editor will automatically format the text according to screenplay conventions

### Supported Elements

#### Scene Headers
- Primary: "مشهد 1", "مشهد 2", etc.
- Secondary: "ليل-داخلي", "نهار-خارجي", etc.
- Tertiary: Location names like "قصر المُشتكي – غرفة الكهف"

#### Character Lines
- Any line ending with a colon is treated as a character line
- Character names are centered and displayed in bold

#### Dialogue
- Text immediately following a character line
- Centered with appropriate margins

#### Action Lines
- Descriptive text about actions, movements, and events
- Right-aligned as per Arabic screenplay conventions

#### Transitions
- Words like "قطع", "ذوبان", etc.
- Centered and bold

### Keyboard Shortcuts
- **Ctrl+1**: Format as scene header
- **Ctrl+2**: Format as character line
- **Ctrl+3**: Format as dialogue
- **Ctrl+4**: Format as action line
- **Ctrl+6**: Format as transition
- **Tab**: Cycle through formatting options

## Testing the Enhancements

### Test Files
Several test files are included to verify the enhancements:

1. **[minimal-test.txt](file:///h:\New folder (26)\arabic-screenplay-editor\src\minimal-test.txt)**: Basic functionality test
2. **[action-line-test.txt](file:///h:\New folder (26)\arabic-screenplay-editor\src\action-line-test.txt)**: Focus on action line classification
3. **[final-test.txt](file:///h:\New folder (26)\arabic-screenplay-editor\src\final-test.txt)**: Complete test with all 10 scenes

### Expected Results
When pasting the test content, you should see:

1. Scene headers properly formatted with:
   - Scene number in bold
   - Time/location information in italics
   - Location name centered and bold

2. Character lines:
   - Centered
   - Bold
   - Uppercase

3. Dialogue:
   - Centered
   - Proper margins

4. Action lines:
   - Right-aligned
   - Proper spacing

5. Transitions:
   - Centered
   - Bold
   - Uppercase

## Troubleshooting

### Common Issues

#### Action Lines Classified as Character Lines
If action lines like "تبتسم هند رغم الامها" are still being classified incorrectly:
1. Ensure the line doesn't end with a colon
2. Check that the line doesn't start with a recognized action verb
3. Verify the line has proper sentence punctuation

#### Scene Headers Not Formatting Properly
If complex scene headers aren't formatting correctly:
1. Ensure proper dash usage (– or -)
2. Check spacing around dashes
3. Verify scene number format

### Debugging Tips
1. Use the browser's developer tools to inspect element formatting
2. Check the console for any error messages
3. Verify that all test files are in the correct directory

## Development Information

### Code Structure
The main logic is contained in `src/ScreenplayEditor.tsx`:

1. **ScreenplayClassifier class**: Contains all classification logic
2. **SceneHeaderAgent function**: Handles scene header formatting
3. **handlePaste function**: Processes pasted content
4. **isCharacterLine function**: Determines if a line is a character line
5. **isLikelyAction function**: Determines if a line is an action line

### Key Improvements Made

#### Scene Header Processing
- Enhanced pattern matching for complex headers
- Better handling of Arabic location names
- Improved formatting of multi-part scene headers

#### Character Line Detection
- Special handling for Arabic text patterns
- Context-aware processing
- Better handling of lines ending with colons

#### Action Line Classification
- Expanded verb database
- Improved pattern matching
- Better handling of descriptive sentences

## Future Enhancements

### Planned Improvements
1. Support for more complex screenplay elements
2. Enhanced export functionality
3. Improved performance for large documents
4. Additional language support

### Contributing
To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support
For issues or questions about the Arabic Screenplay Editor, please contact the development team or file an issue in the repository.