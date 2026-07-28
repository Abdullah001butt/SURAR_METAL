import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Seo } from '@/components/ui/Seo'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <section className="container-px mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center pt-20 text-center">
      <Seo title="Page Not Found" description="The page you're looking for doesn't exist or has moved." path="/404" noIndex />
      <p className="font-display text-7xl font-bold text-primary/20">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-navy">{t('notFound.title')}</h1>
      <p className="mt-2 text-gray">{t('notFound.description')}</p>
      <Link to="/">
        <Button size="lg" className="mt-8">{t('notFound.backHome')}</Button>
      </Link>
    </section>
  )
}
