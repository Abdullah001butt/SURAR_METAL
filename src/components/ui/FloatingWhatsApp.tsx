import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

export function FloatingWhatsApp() {
  return (
    <motion.a
      href="https://wa.me/971554939866"
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-20 left-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 lg:bottom-6"
    >
      <MessageCircle size={26} fill="white" />
    </motion.a>
  )
}
