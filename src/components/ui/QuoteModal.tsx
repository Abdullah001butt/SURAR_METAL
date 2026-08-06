import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { X, Send, Sparkles, AlertCircle, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { productCategories } from '@/data/products'
import { submitQuoteRequest } from '@/services/leads'
import { cn } from '@/utils/cn'

interface QuoteModalProps {
  open: boolean
  onClose: () => void
  variant?: 'default' | 'exit-intent'
}

const STEPS = ['product', 'project', 'contact'] as const
type Step = (typeof STEPS)[number]

export function QuoteModal({ open, onClose, variant = 'default' }: QuoteModalProps) {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const step: Step = STEPS[stepIndex]

  const quoteSchema = useMemo(
    () =>
      z.object({
        productInterest: z.string().min(1, t('quoteModal.errors.product')),
        company: z.string().min(2, t('quoteModal.errors.company')),
        message: z.string().optional(),
        name: z.string().min(2, t('quoteModal.errors.name')),
        email: z.string().email(t('quoteModal.errors.email')),
        phone: z.string().min(7, t('quoteModal.errors.phone')),
      }),
    [t],
  )

  type QuoteFormValues = z.infer<typeof quoteSchema>

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({ resolver: zodResolver(quoteSchema) })

  const selectedProduct = watch('productInterest')

  const fieldsPerStep: Record<Step, (keyof QuoteFormValues)[]> = {
    product: ['productInterest'],
    project: ['company'],
    contact: ['name', 'email', 'phone'],
  }

  const goNext = async () => {
    const valid = await trigger(fieldsPerStep[step])
    if (valid) setStepIndex((i) => Math.min(i + 1, STEPS.length - 1))
  }

  const goBack = () => setStepIndex((i) => Math.max(i - 1, 0))

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
      setStepIndex(0)
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

                {/* Step indicator */}
                <div className="mt-5 flex items-center gap-2">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex flex-1 items-center gap-2">
                      <div
                        className={cn(
                          'grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors',
                          i < stepIndex ? 'bg-primary text-white' : i === stepIndex ? 'bg-primary/15 text-primary ring-2 ring-primary' : 'bg-bg text-gray',
                        )}
                      >
                        {i < stepIndex ? <Check size={13} /> : i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={cn('h-0.5 flex-1 rounded-full transition-colors', i < stepIndex ? 'bg-primary' : 'bg-bg')} />
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                  <AnimatePresence mode="wait" initial={false}>
                    {step === 'product' && (
                      <motion.div
                        key="product"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray">{t('quoteModal.step1Title')}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {productCategories.map((p) => {
                            const label = t(`productsData.${p.id}.title`)
                            const isSelected = selectedProduct === label
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setValue('productInterest', label, { shouldValidate: true })}
                                className={cn(
                                  'rounded-xl border px-3 py-3 text-start text-sm font-medium transition-colors',
                                  isSelected
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-navy/10 bg-bg text-navy hover:border-primary/40',
                                )}
                              >
                                {label}
                              </button>
                            )
                          })}
                        </div>
                        {errors.productInterest && <p className="mt-2 text-xs text-red-500">{errors.productInterest.message}</p>}
                      </motion.div>
                    )}

                    {step === 'project' && (
                      <motion.div
                        key="project"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray">{t('quoteModal.step2Title')}</p>
                        <div>
                          <input
                            {...register('company')}
                            placeholder={t('quoteModal.company')}
                            className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                          />
                          {errors.company && <p className="mt-1 text-xs text-red-500">{errors.company.message}</p>}
                        </div>
                        <textarea
                          {...register('message')}
                          placeholder={t('quoteModal.message')}
                          rows={4}
                          className="w-full resize-none rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                        />
                      </motion.div>
                    )}

                    {step === 'contact' && (
                      <motion.div
                        key="contact"
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray">{t('quoteModal.step3Title')}</p>
                        <div>
                          <input
                            {...register('name')}
                            placeholder={t('quoteModal.fullName')}
                            className="w-full rounded-xl border border-navy/10 bg-bg px-4 py-3 text-sm outline-none focus:border-primary"
                          />
                          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {submitError && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <div className="mt-6 flex gap-3">
                    {stepIndex > 0 && (
                      <Button type="button" variant="ghost" onClick={goBack} icon={<ArrowLeft size={16} className="rtl:rotate-180" />}>
                        {t('quoteModal.back')}
                      </Button>
                    )}
                    {stepIndex < STEPS.length - 1 ? (
                      <Button
                        type="button"
                        size="lg"
                        className="flex-1"
                        onClick={goNext}
                        icon={<ArrowRight size={18} className="rtl:rotate-180" />}
                      >
                        {t('quoteModal.next')}
                      </Button>
                    ) : (
                      <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? t('quoteModal.sending') : t('quoteModal.submit')}
                      </Button>
                    )}
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
