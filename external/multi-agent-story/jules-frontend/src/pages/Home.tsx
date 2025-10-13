import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { BookOpen, Users, Zap, Shield, ArrowRight } from 'lucide-react'

export default function Home() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">J</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Jules</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn btn-primary"
              >
                لوحة التحكم
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-ghost"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            منصة التطوير القصصي
            <span className="text-primary block">متعدد الوكلاء</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            استخدم قوة 11 وكيل ذكي متخصص لتطوير قصصك من الفكرة الأولى إلى النص النهائي.
            نظام متكامل يجمع بين الإبداع البشري والذكاء الاصطناعي.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="btn btn-primary btn-lg"
            >
              ابدأ الآن
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="btn btn-outline btn-lg"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            لماذا Jules؟
          </h2>
          <p className="text-lg text-muted-foreground">
            منصة متطورة تجمع بين أفضل ما في الذكاء الاصطناعي والإبداع البشري
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              11 وكيل متخصص
            </h3>
            <p className="text-muted-foreground">
              كل وكيل له دور محدد في تطوير القصة من البنية إلى الحوار
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              عملية تفاعلية
            </h3>
            <p className="text-muted-foreground">
              5 مراحل من التطوير مع تحديثات فورية وتفاعل مستمر
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ذكاء اصطناعي متقدم
            </h3>
            <p className="text-muted-foreground">
              استخدام Gemini 2.5 Pro لأحدث تقنيات الذكاء الاصطناعي
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg bg-card border border-border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibent text-foreground mb-2">
              أمان وخصوصية
            </h3>
            <p className="text-muted-foreground">
              حماية كاملة لبياناتك ومفاتيح API مع تشفير متقدم
            </p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            كيف يعمل النظام؟
          </h2>
          <p className="text-lg text-muted-foreground">
            عملية منظمة من 5 مراحل لتطوير قصتك
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {[
              {
                step: 1,
                title: 'الموجز الإبداعي',
                description: 'أدخل فكرتك الأساسية والنوع الأدبي والجمهور المستهدف',
                color: 'bg-blue-100 text-blue-800'
              },
              {
                step: 2,
                title: 'توليد الأفكار',
                description: 'يولد النظام فكرتين متكاملتين مع البنية السردية والشخصيات',
                color: 'bg-green-100 text-green-800'
              },
              {
                step: 3,
                title: 'المراجعة المستقلة',
                description: 'كل وكيل يراجع الفكرتين ويقدم تقييمه وتوصياته',
                color: 'bg-purple-100 text-purple-800'
              },
              {
                step: 4,
                title: 'البطولة التفاعلية',
                description: '8 أدوار من النقاش والمنافسة بين الأفكار',
                color: 'bg-orange-100 text-orange-800'
              },
              {
                step: 5,
                title: 'القرار النهائي',
                description: 'تحليل شامل واتخاذ القرار النهائي مع التقرير المفصل',
                color: 'bg-emerald-100 text-emerald-800'
              }
            ].map((phase) => (
              <div key={phase.step} className="flex items-start space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${phase.color}`}>
                  {phase.step}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {phase.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {phase.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-primary rounded-2xl p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">
            ابدأ رحلتك الإبداعية اليوم
          </h2>
          <p className="text-xl mb-8 opacity-90">
            انضم إلى آلاف الكتاب الذين يستخدمون Jules لتطوير قصصهم
          </p>
          <Link
            to={isAuthenticated ? "/dashboard" : "/register"}
            className="btn bg-primary-foreground text-primary hover:bg-primary-foreground/90 btn-lg"
          >
            ابدأ مجاناً
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2024 Jules. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}

