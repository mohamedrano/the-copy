"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BrainCircuit, Layers, PenSquare, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import images from "./images"
import "./slider.css"

const features = [
  {
    icon: PenSquare,
    title: "كتابة",
    description: "محرر متخصص لكتابة سيناريوهات الأفلام والمسلسلات باللغة العربية، مع ميزات تنسيق متقدمة.",
    imageId: "editor-feature",
    link: "/editor",
  },
  {
    icon: Sparkles,
    title: "تطوير",
    description: "احصل على تحليل درامي آلي فوري لنصك، استنادًا إلى أشهر الهياكل القصصية والنماذج الأدبية.",
    imageId: "analysis-feature",
    link: "/analysis/initial",
  },
  {
    icon: Layers,
    title: "تحليل",
    description: "تحليل نصك على سبع طبقات درامية مختلفة للكشف عن نقاط القوة والضعف في البناء السردي.",
    imageId: "deep-analysis-feature",
    link: "/analysis/deep",
  },
  {
    icon: BrainCircuit,
    title: "الورشة",
    description: "فريق من وكلاء الذكاء الاصطناعي يتعاونون لتقديم وجهات نظر متنوعة وأفكار مبتكرة لتطوير كتاباتك.",
    imageId: "brainstorm-feature",
    link: "/brainstorm",
  },
]

export default function Home() {
  const router = useRouter()
  const sliderRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    // Scroll handler applying vertical movement to the slider
    const handleScroll = () => {
      const scrollPos = window.scrollY
      const initialTransform = 'translate3d(-50%, -50%, 0) rotateX(0deg) rotateY(-25deg) rotateZ(-120deg)'
      const zOffset = scrollPos * 0.5
      slider.style.transform = `${initialTransform} translateY(${zOffset}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Mouse interactions per card - smooth transitions to avoid flickering
  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'rotateX(20deg) rotateY(-10deg) rotateZ(130deg) translateZ(200px)'
    e.currentTarget.style.zIndex = '100'
    e.currentTarget.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }

  const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'rotateX(20deg) rotateY(-10deg) rotateZ(130deg)'
    e.currentTarget.style.zIndex = 'auto'
    e.currentTarget.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  }

  const handleCardClick = (index: number) => {
    if (features[index]) {
      router.push(features[index].link)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex items-center justify-between px-4 py-6">
        <Link href="/" aria-label="العودة للصفحة الرئيسية">
          <span className="font-headline text-2xl font-bold text-primary">النسخة</span>
        </Link>
        <Link href="/" aria-label="The Copy Home">
          <span className="font-body text-lg font-bold text-primary">The Copy</span>
        </Link>
      </header>
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
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

        <section className="relative h-screen w-full overflow-hidden bg-black">
          <div ref={sliderRef} className="slider">
            {images.map((image, index) => (
              <div
                key={index}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el
                }}
                className="card cursor-pointer"
                onClick={() => handleCardClick(index)}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleCardClick(index)
                  }
                }}
                aria-label={`انتقل إلى ${features[index]?.title || "الصفحة"}`}
              >
                <img src={image || "/placeholder.svg"} alt={`Slide ${index + 1}`} />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8">
                  <div className="text-center text-white p-6 max-w-sm">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      {features[index] && (() => {
                        const IconComponent = features[index].icon
                        return <IconComponent className="h-8 w-8" />
                      })()}
                      <h3 className="text-3xl font-black">{features[index]?.title}</h3>
                    </div>
                    <p className="text-lg font-semibold opacity-95 leading-relaxed">{features[index]?.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-white">
            <p className="text-sm">استخدم الماوس أو الأسهم للتنقل، أو انقر على الصورة للدخول</p>
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
              return (
                <Link key={feature.title} href={feature.link} className="block">
                  <Card className="h-full transform-gpu transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <CardHeader>
                      <div className="mb-4 flex items-center gap-4">
                        <div className="rounded-lg bg-accent/20 p-3 text-accent">
                          <feature.icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
      <footer className="container mx-auto border-t px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-headline text-2xl font-bold text-primary">النسخة</span>
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} النسخة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}
