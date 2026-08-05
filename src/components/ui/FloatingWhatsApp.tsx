import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useScrollPast } from '@/hooks/useScrollPast'

export function FloatingWhatsApp() {
  // Waits for a small scroll instead of showing instantly on load — on mobile, an
  // instantly-visible button at this position sits right over the first section's
  // heading/description on several pages (Home, Products, Industries all share the
  // same PageHero + SectionTitle layout, which lands text in the same spot).
  const visible = useScrollPast(80)

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="https://wa.me/971554939866"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-20 left-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 lg:bottom-6"
        >
          <MessageCircle size={26} fill="white" />
        </motion.a>
      )}
    </AnimatePresence>
  )
}
