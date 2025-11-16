import { useState } from 'react'
import { Lightbulb, ChevronDown, Shuffle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * TipCard component displays a language learning tip
 * Collapsible with header always visible
 * @param {Object} tip - The tip object to display
 * @param {Function} onNextTip - Callback to show the next tip
 */
export const TipCard = ({ tip, onNextTip }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!tip) return null

  const handleNextTip = (e) => {
    e.stopPropagation()
    onNextTip?.()
  }

  return (
    <motion.div
      key={tip.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="bg-yellow-100 dark:bg-yellow-900 rounded-lg border border-yellow-300 dark:border-yellow-700 overflow-hidden"
    >
      {/* Header - Always visible */}
      <div
        className="flex items-center gap-3 px-6 py-4 cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5 text-amber-700 dark:text-amber-300" />
        </div>
        <h3 className="flex-1 text-base font-semibold text-gray-900 dark:text-gray-100">
          {tip.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextTip}
            className="h-8 px-2 hover:bg-yellow-300 dark:hover:bg-yellow-700"
            title="Next tip"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <ChevronDown
            className={`w-5 h-5 text-gray-700 dark:text-gray-300 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2">
              <div className="prose prose-sm max-w-none prose-gray dark:prose-invert">
                <Markdown remarkPlugins={[remarkGfm]}>{tip.content}</Markdown>
              </div>

              {/* Category and Tags */}
              {(tip.category || (tip.tags && tip.tags.length > 0)) && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {tip.category && (
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded">
                      {tip.category}
                    </span>
                  )}
                  {tip.tags && tip.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs text-gray-700 dark:text-gray-300 bg-yellow-200 dark:bg-yellow-800 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
