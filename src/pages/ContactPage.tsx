import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { AlertCircle, Mail, MapPin, Phone } from 'lucide-react'
import { PageHero } from '@/components/ui/PageHero'
import { Button } from '@/components/ui/Button'
import { submitContactMessage } from '@/services/leads'
import { Seo } from '@/components/ui/Seo'

export function ContactPage() {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const contactSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('contactPage.errors.name')),
        email: z.string().email(t('contactPage.errors.email')),
        message: z.string().min(10, t('contactPage.errors.message')),
      }),
    [t],
  )

  type ContactFormValues = z.infer<typeof contactSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) })

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitError(null)
    try {
      await submitContactMessage(data)
      setSuccess(true)
    } catch {
      setSubmitError(t('contactPage.error'))
    }
  }

  const details = [
    { icon: MapPin, label: 'Industrial Area, Ajman, UAE' },
    { icon: Phone, label: '+971 55 493 9866', href: 'tel:+971554939866' },
    { icon: Phone, label: '+971 50 206 9782', href: 'tel:+971502069782' },
    { icon: Mail, label: 'info@alsururmetal.com', href: 'mailto:info@alsururmetal.com' },
  ]

  return (
    <>
      <Seo
        title="Contact Us"
        description="Get in touch with Al Surur General Store Equipment Trading LLC in Ajman, UAE. Request a free site survey and quote for your warehouse storage project."
        path="/contact"
      />
      <PageHero eyebrow={t('contactPage.eyebrow')} title={t('contactPage.title')} description={t('contactPage.description')} breadcrumbs={[{ label: t('nav.contact') }]} />
      <section className="container-px mx-auto max-w-5xl py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-navy">{t('contactPage.getInTouch')}</h2>
            <ul className="mt-6 space-y-4 ps-16 md:ps-0">
              {details.map((d) => (
                <li key={d.label} className="flex items-center gap-3 text-sm text-gray">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <d.icon size={18} />
                  </span>
                  {d.href ? <a href={d.href} className="hover:text-primary" dir="ltr">{d.label}</a> : d.label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            {success ? (
              <div className="rounded-3xl bg-bg p-8 text-center ring-1 ring-navy/5">
                <h3 className="font-display text-xl font-semibold text-navy">{t('contactPage.successTitle')}</h3>
                <p className="mt-2 text-sm text-gray">{t('contactPage.successDescription')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <input
                    {...register('name')}
                    placeholder={t('contactPage.fullName')}
                    className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    {...register('email')}
                    placeholder={t('contactPage.email')}
                    className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <textarea
                    {...register('message')}
                    placeholder={t('contactPage.messagePlaceholder')}
                    rows={5}
                    className="w-full resize-none rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                </div>

                {submitError && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    {submitError}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('contactPage.sending') : t('contactPage.send')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
