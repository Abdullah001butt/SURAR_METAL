import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { X, Send, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { productCategories } from '@/data/products'
import { submitQuoteRequest } from '@/services/leads'

interface QuoteModalProps {
  open: boolean
  onClose: () => void
  variant?: 'default' | 'exit-intent'
}

export function QuoteModal({ open, onClose, variant = 'default' }: QuoteModalProps) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const quoteSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, t('quoteModal.errors.name')),
        company: z.string().min(2, t('quoteModal.errors.company')),
        email: z.string().email(t('quoteModal.errors.email')),
        phone: z.string().min(7, t('quoteModal.errors.phone')),
        productInterest: z.string().min(1, t('quoteModal.errors.product')),
        message: z.string().optional(),
      }),
    [t],
  )

  type QuoteFormValues = z.infer<typeof quoteSchema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({ resolver: zodResolver(quoteSchema) })

  const onSubmit = async (data: QuoteFormValues) => {
    setSubmitError(null)
    try {
      await submitQuoteRequest(data)
      setSuccess(true)
    } catch {
      setSubmitError(t('quoteModal.error'))
    }
  }

  const handleClose = () => {
    onClose()
    setSubmitError(null)
    setTimeout(() => {
      reset()
      setSuccess(false)
    }, 300)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/70 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl"
          >
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute end-5 top-5 grid h-9 w-9 place-items-center rounded-full text-gray hover:bg-navy/5"
            >
              <X size={18} />
            </button>

            {success ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                  <Send size={24} />
                </div>
                <h3 className="font-display text-2xl font-semibold text-navy">{t('quoteModal.successTitle')}</h3>
                <p className="mt-2 text-sm text-gray">{t('quoteModal.successDescription')}</p>
                <Button className="mt-6" onClick={handleClose}>{t('quoteModal.close')}</Button>
              </div>
            ) : (
              <>
                {variant === 'exit-intent' && (
                  <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                    <Sparkles size={12} />
                    {t('quoteModal.exitBadge')}
                  </span>
                )}
                <h3 className="font-display text-2xl font-semibold text-navy">
                  {variant === 'exit-intent' ? t('quoteModal.exitTitle') : t('quoteModal.title')}
                </h3>
                <p className="mt-1 text-sm text-gray">
                  {variant === 'exit-intent' ? t('quoteModal.exitDescription') : t('quoteModal.description')}
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        {...register('name')}
                        placeholder={t('quoteModal.fullName')}
                        className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div>
                      <input
                        {...register('company')}
                        placeholder={t('quoteModal.company')}
                        className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                      {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        {...register('email')}
                        placeholder={t('quoteModal.email')}
                        className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div>
                      <input
                        {...register('phone')}
                        placeholder={t('quoteModal.phone')}
                        className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <select
                      {...register('productInterest')}
                      defaultValue=""
                      className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="" disabled>{t('quoteModal.selectProduct')}</option>
                      {productCategories.map((p) => (
                        <option key={p.id} value={t(`productsData.${p.id}.title`)}>{t(`productsData.${p.id}.title`)}</option>
                      ))}
                    </select>
                    {errors.productInterest && <p className="mt-1 text-xs text-red-500">{errors.productInterest.message}</p>}
                  </div>

                  <textarea
                    {...register('message')}
                    placeholder={t('quoteModal.message')}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                  />

                  {submitError && (
                    <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t('quoteModal.sending') : t('quoteModal.submit')}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
