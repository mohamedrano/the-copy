
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  BrainCircuit,
  Layers,
  PenSquare,
  Sparkles,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/logo';

const features = [
  {
    icon: PenSquare,
    title: 'كتابة',
    description:
      'محرر متخصص لكتابة سيناريوهات الأفلام والمسلسلات باللغة العربية، مع ميزات تنسيق متقدمة.',
    imageId: 'editor-feature',
    link: '/editor',
  },
  {
    icon: Sparkles,
    title: 'تحليل',
    description:
      'احصل على تحليل درامي آلي فوري لنصك، استنادًا إلى أشهر الهياكل القصصية والنماذج الأدبية.',
    imageId: 'analysis-feature',
    link: '/analysis/initial',
  },
  {
    icon: Layers,
    title: 'تطوير',
    description:
      'تحليل نصك على سبع طبقات درامية مختلفة للكشف عن نقاط القوة والضعف في البناء السردي.',
    imageId: 'deep-analysis-feature',
    link: '/analysis/deep',
  },
  {
    icon: BrainCircuit,
    title: 'الورشة',
    description:
      'فريق من وكلاء الذكاء الاصطناعي يتعاونون لتقديم وجهات نظر متنوعة وأفكار مبتكرة لتطوير كتاباتك.',
    imageId: 'brainstorm-feature',
    link: '/brainstorm',
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <Link href="/" aria-label="العودة للصفحة الرئيسية">
          <span className="font-headline text-2xl font-bold text-primary">
            النسخة
          </span>
        </Link>
        <Link href="/" aria-label="The Copy Home">
          <span className="font-body text-lg font-bold text-primary">
            The Copy
          </span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="container relative mx-auto flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="my-8 ml-8 flex flex-col items-center justify-center gap-4">
              <h1 className="pr-2 font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                <span className="text-primary">النسخة</span> .... بس أصلي
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-foreground md:text-xl">
                Because Originals Know What to Copy
              </p>
              <div className="ml-4">
                <Button asChild size="lg">
                  <Link href="/editor">
                    ابدأ الكتابة
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 py-20 sm:py-28">
          <div className="text-center">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              أدواتك نحو الإبداع
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const featureImage = PlaceHolderImages.find(
                (img) => img.id === feature.imageId
              );
              return (
                <Link key={feature.title} href={feature.link} className="block">
                  <Card
                    className="h-full transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    {featureImage && (
                      <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-t-lg">
                        <Image
                          src={featureImage.imageUrl}
                          alt={featureImage.description}
                          width={600}
                          height={400}
                          className="object-cover"
                          data-ai-hint={featureImage.imageHint}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="mb-4 flex items-center gap-4">
                        <div className="rounded-lg bg-accent/20 p-3 text-accent">
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-headline text-xl">
                          {feature.title}
                        </CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <footer className="container mx-auto border-t px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} النسخة. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
}
