import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Globe,
  Search,
  TrendingUp,
  Target,
  FileText,
  Link2,
  Image,
  Code,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Award,
  Zap,
  BarChart3,
  Users,
  Eye,
  MousePointer
} from 'lucide-react'
import AdminLayoutNew from '../../components/admin/AdminLayoutNew'
import { useRBAC } from '../../context/RBACContext'
import { PERMISSIONS } from '../../context/RBACContext'

const AdminGoogleSEOPage = () => {
  const { hasPermission } = useRBAC()
  const [copiedItem, setCopiedItem] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const copyToClipboard = (text, itemName) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(itemName)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  // SEO Score
  const seoScore = {
    overall: 87,
    technical: 92,
    content: 85,
    backlinks: 79,
    mobile: 95
  }

  // Keywords performance
  const keywords = [
    { keyword: 'food delivery vicino a me', position: 3, volume: 18100, difficulty: 72, trend: 'up' },
    { keyword: 'ordinare cibo online', position: 5, volume: 12500, difficulty: 68, trend: 'up' },
    { keyword: 'consegna pizza a domicilio', position: 2, volume: 22300, difficulty: 65, trend: 'stable' },
    { keyword: 'ristoranti delivery', position: 7, volume: 9800, difficulty: 70, trend: 'down' },
    { keyword: 'app food delivery', position: 4, volume: 15600, difficulty: 75, trend: 'up' }
  ]

  // Meta tags ottimizzati
  const metaTags = {
    title: 'FoodApp - Consegna Cibo a Domicilio | Ordina Online dai Migliori Ristoranti',
    description: 'Ordina cibo a domicilio dai migliori ristoranti della tua città. Consegna veloce in 30 minuti. Pizza, sushi, burger e molto altro. Scarica l\'app e risparmia con i coupon!',
    keywords: 'food delivery, consegna cibo, ordina online, ristoranti, pizza domicilio, app food',
    ogTitle: 'FoodApp - Il Tuo Cibo Preferito, Consegnato Velocemente',
    ogDescription: 'Scopri centinaia di ristoranti, ordina con un click e ricevi il tuo cibo preferito in 30 minuti. Promozioni esclusive ogni giorno!',
    ogImage: 'https://foodapp.com/og-image.jpg',
    twitterCard: 'summary_large_image'
  }

  // Content strategy per battere la concorrenza
  const contentStrategy = [
    {
      title: 'SEO Strategy - Battere Deliveroo & Just Eat',
      sections: [
        {
          heading: '1. Local SEO Dominance',
          points: [
            'Creare landing page uniche per ogni città/quartiere (es. "Food Delivery Milano Centro")',
            'Google My Business ottimizzato per ogni zona di consegna',
            'Local schema markup con recensioni e orari',
            'Contenuti localizzati con menzioni di luoghi specifici',
            'Partnership con blog food locali per backlinks'
          ]
        },
        {
          heading: '2. Content Marketing Superiore',
          points: [
            'Blog con ricette, guide ristoranti, interviste chef',
            'Video recensioni ristoranti partner su YouTube',
            'Guide "Migliori 10 pizzerie/sushi/burger di [città]"',
            'Contenuti stagionali e trending (es. "Menu Natale 2025")',
            'User-generated content: condivisione foto clienti'
          ]
        },
        {
          heading: '3. Technical SEO Excellence',
          points: [
            'Core Web Vitals ottimizzati (LCP < 2.5s, FID < 100ms, CLS < 0.1)',
            'Mobile-first indexing con PWA',
            'Structured data per menu, recensioni, FAQ',
            'Sitemap dinamica aggiornata in real-time',
            'Canonical tags e hreflang per multi-lingua'
          ]
        },
        {
          heading: '4. Link Building Strategy',
          points: [
            'Guest posting su blog food di settore',
            'Partnerships con influencer food locali',
            'Press release per nuove aperture/partnership',
            'Directory listing su aggregatori specializzati',
            'Collaborazioni con food blogger per recensioni'
          ]
        },
        {
          heading: '5. Unique Value Propositions',
          points: [
            '"Consegna in 25 min o è gratis" - creare urgency',
            '"0% commissioni per i primi 3 mesi" - attirare ristoranti',
            'Loyalty program più generoso (10% cashback vs 3% competitors)',
            'Menu esclusivi non disponibili su altre piattaforme',
            'Packaging eco-friendly - posizionamento sostenibile'
          ]
        }
      ]
    },
    {
      title: 'Contenuti da Creare (Piano 90 giorni)',
      sections: [
        {
          heading: 'Settimane 1-4: Foundation',
          points: [
            '10 landing pages città principali',
            '15 articoli blog "Best of" per location',
            '5 video recensioni ristoranti top',
            'Ottimizzazione tecnica completa sito',
            'Setup Google My Business per tutte le zone'
          ]
        },
        {
          heading: 'Settimane 5-8: Content Expansion',
          points: [
            '20 guide categorie cibo (pizza, sushi, vegan, etc.)',
            'Serie YouTube "Dietro le quinte" con chef partner',
            '10 guest post su blog food alto traffico',
            'Campagna Instagram con UGC clienti',
            '5 PR articles su testate locali'
          ]
        },
        {
          heading: 'Settimane 9-12: Scaling & Authority',
          points: [
            'Partnership con 5 food influencer (>50k followers)',
            '30 recensioni ristoranti dettagliate',
            'Podcast series "Food Stories" con founder ristoranti',
            'Campagna link building aggressiva (target 50 backlinks)',
            'Launch loyalty program con PR push'
          ]
        }
      ]
    },
    {
      title: 'Testi Ottimizzati per Conversione',
      sections: [
        {
          heading: 'Homepage Hero Copy',
          points: [
            'H1: "Il Tuo Cibo Preferito, Consegnato in 25 Minuti"',
            'Subheading: "Scopri 500+ ristoranti. Ordina con un click. Cashback 10% su ogni ordine."',
            'CTA: "Ordina Ora e Risparmia €5" (urgency + sconto)',
            'Trust signals: "★★★★★ 4.8/5 da 12.000+ clienti"',
            'Social proof: "47.832 ordini consegnati questo mese"'
          ]
        },
        {
          heading: 'SEO-Optimized Product Descriptions',
          points: [
            'Includere keywords long-tail naturalmente',
            'Benefits-focused (non solo features)',
            'Include "vicino a me", "nella tua città", local terms',
            'FAQ section con domande comuni (featured snippets)',
            'Recensioni clienti integrate (schema markup)'
          ]
        },
        {
          heading: 'Google Ads Copy (battere competitors)',
          points: [
            'Headline 1: "Food Delivery 25 Min | Cashback 10%"',
            'Headline 2: "Sconto €5 sul Primo Ordine"',
            'Headline 3: "500+ Ristoranti | Consegna Gratis da €20"',
            'Description: "Ordina dai migliori ristoranti. Consegna veloce garantita. Loyalty program esclusivo. Scarica l\'app!"',
            'Extensions: recensioni, promozioni, link sitelink'
          ]
        }
      ]
    }
  ]

  return (
    <AdminLayoutNew>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
              <Globe className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
              Google & SEO Strategy
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Ottimizzazione motori di ricerca e content marketing</p>
          </div>
        </div>

        {/* SEO Score Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg md:rounded-xl p-4 md:p-6 text-white shadow-lg col-span-2 sm:col-span-1"
          >
            <div className="text-center">
              <Award className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2" />
              <p className="text-xs md:text-sm text-green-100 mb-2">SEO Score</p>
              <h3 className="text-3xl md:text-4xl font-bold">{seoScore.overall}</h3>
              <p className="text-xs text-green-100 mt-2">Excellent</p>
            </div>
          </motion.div>

          {[
            { label: 'Technical', score: seoScore.technical, icon: Code },
            { label: 'Content', score: seoScore.content, icon: FileText },
            { label: 'Backlinks', score: seoScore.backlinks, icon: Link2 },
            { label: 'Mobile', score: seoScore.mobile, icon: MousePointer }
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 shadow-md"
              >
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <Icon className="w-4 h-4 md:w-6 md:h-6 text-orange-600" />
                  <span className="text-xl md:text-2xl font-bold text-gray-900">{item.score}</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">{item.label}</p>
                <div className="mt-2 md:mt-3 w-full bg-gray-200 rounded-full h-1.5 md:h-2">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 md:h-2 rounded-full transition-all"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'keywords', label: 'Keywords', icon: Search },
                { id: 'meta', label: 'Meta Tags', icon: Code },
                { id: 'strategy', label: 'Strategy', icon: Target }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 md:px-6 py-2.5 md:py-4 text-xs md:text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-4 md:p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
                  <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <Eye className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">Organic Traffic</h4>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">12,347</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm mt-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span>+23.5% vs last month</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <MousePointer className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">Click-Through Rate</h4>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">3.8%</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm mt-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span>+1.2% vs last month</span>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                      <Link2 className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                      <h4 className="font-semibold text-sm md:text-base text-gray-900">Backlinks</h4>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">1,284</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs md:text-sm mt-2">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
                      <span>+87 new this month</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm md:text-base text-blue-900 mb-2">Opportunità di Miglioramento</h4>
                      <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-blue-800">
                        <li>• Ottimizzare 12 pagine con Core Web Vitals sotto soglia</li>
                        <li>• Aggiungere schema markup a 45 pagine prodotto</li>
                        <li>• Creare contenuti per 23 keywords ad alto volume non coperte</li>
                        <li>• Migliorare meta description su 67 pagine (troppo corte)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Keywords Tab */}
            {activeTab === 'keywords' && (
              <div>
                <div className="mb-3 md:mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 md:mb-2">Top Performing Keywords</h3>
                  <p className="text-xs md:text-sm text-gray-600">Monitora le tue keywords principali e la loro performance</p>
                </div>

                {/* Mobile Cards */}
                <div className="block lg:hidden space-y-3">
                  {keywords.map((kw, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 flex-1">{kw.keyword}</h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                          #{kw.position}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500 mb-1">Volume</p>
                          <p className="font-semibold text-gray-900">{kw.volume.toLocaleString()}/mo</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Difficoltà</p>
                          <div className="flex items-center gap-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  kw.difficulty > 70 ? 'bg-red-600' : kw.difficulty > 50 ? 'bg-yellow-600' : 'bg-green-600'
                                }`}
                                style={{ width: `${kw.difficulty}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{kw.difficulty}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1">Trend</p>
                          <div className="flex items-center">
                            {kw.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-600" />}
                            {kw.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />}
                            {kw.trend === 'stable' && <span className="text-gray-400">—</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posizione</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficoltà</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {keywords.map((kw, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{kw.keyword}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              #{kw.position}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{kw.volume.toLocaleString()}/mo</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    kw.difficulty > 70 ? 'bg-red-600' : kw.difficulty > 50 ? 'bg-yellow-600' : 'bg-green-600'
                                  }`}
                                  style={{ width: `${kw.difficulty}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600">{kw.difficulty}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {kw.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600" />}
                            {kw.trend === 'down' && <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />}
                            {kw.trend === 'stable' && <span className="text-gray-400">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Meta Tags Tab */}
            {activeTab === 'meta' && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Meta Tags Ottimizzati</h3>

                  {[
                    { label: 'Title Tag', value: metaTags.title, maxLength: 60 },
                    { label: 'Meta Description', value: metaTags.description, maxLength: 160 },
                    { label: 'Keywords', value: metaTags.keywords, maxLength: null },
                    { label: 'OG Title', value: metaTags.ogTitle, maxLength: 60 },
                    { label: 'OG Description', value: metaTags.ogDescription, maxLength: 160 },
                    { label: 'OG Image', value: metaTags.ogImage, maxLength: null }
                  ].map((tag, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 md:p-4 mb-3 md:mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs md:text-sm font-medium text-gray-700">{tag.label}</label>
                        <div className="flex items-center gap-2">
                          {tag.maxLength && (
                            <span className={`text-xs ${
                              tag.value.length > tag.maxLength ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {tag.value.length}/{tag.maxLength}
                            </span>
                          )}
                          <button
                            onClick={() => copyToClipboard(tag.value, tag.label)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {copiedItem === tag.label ? (
                              <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded p-2 md:p-3 text-xs md:text-sm text-gray-900 font-mono break-words">
                        {tag.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-start gap-2 md:gap-3">
                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm md:text-base text-yellow-900 mb-2">Pro Tips</h4>
                      <ul className="space-y-1 text-xs md:text-sm text-yellow-800">
                        <li>• Includi keyword principale all'inizio del title</li>
                        <li>• Meta description deve contenere CTA chiara</li>
                        <li>• OG Image dimensioni ottimali: 1200x630px</li>
                        <li>• Testa meta tags con Google Rich Results Test</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Strategy Tab */}
            {activeTab === 'strategy' && (
              <div className="space-y-6 md:space-y-8">
                {contentStrategy.map((strategy, strategyIndex) => (
                  <div key={strategyIndex}>
                    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                      <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-600 flex-shrink-0" />
                      <h2 className="text-lg md:text-2xl font-bold text-gray-900">{strategy.title}</h2>
                    </div>

                    <div className="space-y-3 md:space-y-6">
                      {strategy.sections.map((section, sectionIndex) => (
                        <motion.div
                          key={sectionIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: sectionIndex * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4 md:p-6"
                        >
                          <h3 className="text-sm md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0">
                              {sectionIndex + 1}
                            </span>
                            <span className="break-words">{section.heading}</span>
                          </h3>
                          <ul className="space-y-2 md:space-y-3">
                            {section.points.map((point, pointIndex) => (
                              <li key={pointIndex} className="flex items-start gap-2 md:gap-3">
                                <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-xs md:text-sm text-gray-700">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </div>

                    {strategyIndex < contentStrategy.length - 1 && (
                      <div className="my-6 md:my-8 border-t-2 border-gray-200" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayoutNew>
  )
}

export default AdminGoogleSEOPage
