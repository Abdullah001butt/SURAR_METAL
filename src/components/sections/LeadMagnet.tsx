import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Download, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Magnetic } from '@/components/ui/Magnetic'
import { ConfettiBurst } from '@/components/ui/ConfettiBurst'
import { submitLeadMagnetRequest } from '@/services/leads'

const GUIDE_URL = '/al-surur-warehouse-buying-guide.pdf'

export function LeadMagnet() {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [unlocked, setUnlocked] = useState(false)

  const schema = z.object({
    name: z.string().min(2, t('leadMagnet.errors.name')),
    phone: z.string().min(7, t('leadMagnet.errors.phone')),
    email: z.string().email(t('leadMagnet.errors.email')).optional().or(z.literal('')),
  })
  type FormValues = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setSubmitError(null)
    try {
      await submitLeadMagnetRequest({ name: data.name, phone: data.phone, email: data.email || undefined })
      setUnlocked(true)
      // Trigger the actual download once the lead is logged.
      const link = document.createElement('a')
      link.href = GUIDE_URL
      link.download = 'Al-Surur-Warehouse-Storage-Buying-Guide.pdf'
      link.click()
    } catch {
      setSubmitError(t('leadMagnet.error'))
    }
  }

  return (
    <section className="bg-bg py-20 lg:py-24">
      <div className="container-px mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 items-center gap-10 rounded-3xl bg-white p-8 ring-1 ring-navy/5 sm:p-12 lg:grid-cols-[1fr_1.1fr]"
        >
          <div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <FileText size={26} />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-navy sm:text-3xl">{t('leadMagnet.title')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-gray">{t('leadMagnet.description')}</p>
            <ul className="mt-5 space-y-2">
              {(t('leadMagnet.points', { returnObjects: true }) as string[]).map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-navy">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-bg p-6 sm:p-8">
            {unlocked ? (
              <div className="relative py-6 text-center">
                <ConfettiBurst />
                <div className="relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-navy">{t('leadMagnet.successTitle')}</h3>
                <p className="mt-2 text-sm text-gray">{t('leadMagnet.successDescription')}</p>
                <a
                  href={GUIDE_URL}
                  download="Al-Surur-Warehouse-Storage-Buying-Guide.pdf"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <Download size={15} /> {t('leadMagnet.downloadAgain')}
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div>
                  <input
                    {...register('name')}
                    placeholder={t('leadMagnet.namePlaceholder')}
                    className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    {...register('phone')}
                    placeholder={t('leadMagnet.phonePlaceholder')}
                    dir="ltr"
                    className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>
                <div>
                  <input
                    {...register('email')}
                    placeholder={t('leadMagnet.emailPlaceholder')}
                    dir="ltr"
                    className="w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {submitError && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {submitError}
                  </div>
                )}

                <Magnetic className="block">
                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting} icon={<Download size={17} />}>
                    {isSubmitting ? t('leadMagnet.sending') : t('leadMagnet.downloadButton')}
                  </Button>
                </Magnetic>
                <p className="text-center text-[11px] text-gray">{t('leadMagnet.disclaimer')}</p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
