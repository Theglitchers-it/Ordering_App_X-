import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { searchBarSlide } from '../utils/animations'

function SearchBar({ value, onChange }) {
  return (
    <motion.div
      {...searchBarSlide}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <motion.input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cerca piatti o ristoranti..."
          className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-primary focus:outline-none transition-colors duration-200"
          whileFocus={{
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
        />
      </div>
    </motion.div>
  )
}

export default SearchBar
