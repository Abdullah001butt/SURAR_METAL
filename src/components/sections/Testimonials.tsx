import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { useTranslation } from 'react-i18next'
import { Star, Quote } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { GradientOrbs } from '@/components/ui/GradientOrbs'
import { testimonials } from '@/data/testimonials'
import 'swiper/css'
import 'swiper/css/pagination'

export function Testimonials() {
  const { t, i18n } = useTranslation()

  return (
    <section className="seam-top-navy relative overflow-hidden bg-navy py-28 lg:py-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,90,31,0.1),transparent_50%)]" />
      <GradientOrbs />
      <div className="container-px relative mx-auto max-w-7xl">
        <SectionTitle eyebrow={t('testimonials.eyebrow')} title={t('testimonials.title')} align="center" light size="lg" />

        <div className="mt-14">
          <Swiper
            key={i18n.dir()}
            dir={i18n.dir()}
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: '.testimonial-pagination' }}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="!pb-4"
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <div className="glass flex h-full flex-col rounded-3xl p-8">
                  <Quote className="text-primary" size={28} />
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-white/80">"{t(`testimonialsData.${item.id}.quote`)}"</p>
                  <div className="mt-6 flex items-center gap-1">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} size={14} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <div className="mt-3 border-t border-white/10 pt-4">
                    <p className="text-sm font-semibold text-white">{t(`testimonialsData.${item.id}.name`)}</p>
                    <p className="text-xs text-white/50">
                      {t(`testimonialsData.${item.id}.role`)}, {t(`testimonialsData.${item.id}.company`)}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="testimonial-pagination mt-8 flex justify-center gap-2" />
        </div>
      </div>
    </section>
  )
}
