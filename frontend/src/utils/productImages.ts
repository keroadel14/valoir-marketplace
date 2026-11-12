// Curated luxury catalog data with verified high-resolution images
export interface CuratedProductInfo {
  title: string
  imageUrl: string
  brand: string
  description: string
}

interface CategorySpec {
  key: string
  brand: string
  items: {
    title: string
    imageUrl: string
    description: string
  }[]
}

const LUXURY_CATALOG: CategorySpec[] = [
  {
    key: 'fashion',
    brand: 'Maison Lumière',
    items: [
      { title: 'Silk Tailored Blazer in Midnight Black', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop', description: 'Exquisitely cut from pure Italian mulberry silk with satin peaked lapels. Tailored for an effortless modern silhouette.' },
      { title: 'Double-Breasted Wool Trench Coat', imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=800&auto=format&fit=crop', description: 'Crafted from virgin melton wool in camel. Features horn buttons, structured storm flaps, and a belted waist.' },
      { title: 'Evening Silk Chiffon Draped Gown', imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800&auto=format&fit=crop', description: 'Floor-length couture gown in flowing emerald chiffon with delicate hand-pleated detailing and open back.' },
      { title: 'Merino Wool Ribbed Cardigan', imageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=800&auto=format&fit=crop', description: 'Ultra-fine spun Australian merino wool. Soft drape, mother-of-pearl buttons, and refined ribbed hems.' },
      { title: 'Tailored Linen Summer Suit', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop', description: 'Breathable Irish linen jacket and trousers in off-white. Unstructured shoulders for relaxed elegance.' },
      { title: 'Satin Cocktail Dress with Slit', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', description: 'Sculpted cocktail dress in heavy luminous silk satin with architectural draping and side slit.' },
      { title: 'Oversized Storm Trench Coat', imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop', description: 'Weather-resistant gabardine cotton trench coat with raglan sleeves and vintage tortoiseshell buckles.' },
    ],
  },
  {
    key: 'shoes',
    brand: 'Atelier Noir',
    items: [
      { title: 'Italian Calfskin Oxford Brogues', imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop', description: 'Goodyear welted hand-burnished Tuscan calfskin oxfords. Leather soles with hand-nailed rubber heels.' },
      { title: 'Hand-Stitched Suede Penny Loafers', imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop', description: 'Plush Italian suede loafers in rich cognac. Unlined construction for supreme flexibility and glove-like fit.' },
      { title: 'Minimalist Nappa Leather High-Tops', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', description: 'Clean-lined sneakers handmade in Civitanova Marche from full-grain butter-soft nappa leather.' },
      { title: 'Pointed Stiletto Suede Pumps', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', description: 'Timeless 90mm pumps with sleek pointed silhouette and padded leather insole for evening comfort.' },
      { title: 'Burnished Chelsea Leather Boots', imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?q=80&w=800&auto=format&fit=crop', description: 'Durable full-grain leather boots with tonal elastic side gussets and storm-welted outsoles.' },
    ],
  },
  {
    key: 'bags',
    brand: 'Pearl & Thread',
    items: [
      { title: 'Pebbled Calfskin Satchel Bag', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop', description: 'Structured top-handle bag in supple pebbled leather, finished with palladium lock hardware and suede lining.' },
      { title: 'Quilted Leather Crossbody with Gold Chain', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', description: 'Chevron quilted lambskin with heavy gold-plated hardware and versatile slide-through chain strap.' },
      { title: 'Minimalist Structured Everyday Tote', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop', description: 'Spacious architectural tote in vegetable-tanned harness leather with interior zip laptop compartment.' },
      { title: 'Handcrafted Canvas & Leather Weekender', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop', description: 'Heavyweight waxed cotton canvas reinforced with bridle leather trim and antique brass hardware.' },
      { title: 'Suede Baguette Shoulder Bag', imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop', description: 'Compact 90s-inspired baguette bag in forest green velvet suede with magnetic flap closure.' },
    ],
  },
  {
    key: 'jewelry',
    brand: 'Casa Bellini Fine Jewels',
    items: [
      { title: '18k Rose Gold Chronograph Watch', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', description: 'Swiss automatic chronograph movement with sunburst anthracite dial and hand-stitched alligator strap.' },
      { title: '18k Yellow Gold Diamond Halo Pendant', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', description: 'Brilliant cut center stone encircled by pave diamonds on an adjustable 18-karat gold chain.' },
      { title: 'Emerald Cut Solitaire Cocktail Ring', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', description: 'Statement cocktail ring with an emerald-cut center stone set in a four-prong platinum mount.' },
      { title: 'South Sea Pearl Drop Earrings', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', description: 'Lustrous cultured pearls suspended from delicate diamond huggie hoops in white gold.' },
      { title: 'Classic Minimal Automatic Watch', imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop', description: 'Sapphire crystal exhibition caseback, mechanical self-winding movement, and refined brushed steel case.' },
    ],
  },
  {
    key: 'beauty',
    brand: 'Maison Lumière Parfums',
    items: [
      { title: 'Oud & Bergamot Luxury Eau de Parfum', imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop', description: 'Smoky oud balanced with crisp bergamot and cedar. A refined niche fragrance in a heavy glass flacon.' },
      { title: 'Botanical Restorative Facial Glow Oil', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop', description: 'A concentrated blend of botanical oils and squalane, created for a dewy, radiant-looking finish.' },
      { title: 'Amber Noir Signature Extrait de Parfum', imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop', description: 'A warm blend of vanilla, amber resin, and spice in a refillable glass vessel.' },
      { title: 'Velvet Matte Lip Elixir Collection', imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop', description: 'Weightless, richly pigmented liquid lipstick with a comfortable velvet-matte finish.' },
    ],
  },
  {
    key: 'home',
    brand: 'Studio Harmonia',
    items: [
      { title: 'Sculptural Ribbed Ceramic Vase', imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop', description: 'Wheel-thrown stoneware vase with tactile texture and warm ivory glaze, made for contemporary interiors.' },
      { title: 'Minimalist Brushed Brass Table Lamp', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop', description: 'Sculptural architectural lighting with a warm dimmable glow and a solid brass finish.' },
      { title: 'Hand-Poured Soy & Amber Candle', imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop', description: 'Natural soy wax candle in a matte ceramic jar, with layered notes of cedar and cardamom.' },
      { title: 'Natural Travertine Stone Catchall', imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop', description: 'A solid travertine catchall with softly carved curves for holding jewelry and everyday essentials.' },
    ],
  },
  {
    key: 'electronics',
    brand: 'Acoustic Haus',
    items: [
      { title: 'Active Noise-Cancelling Headphones', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', description: 'Comfort-focused over-ear headphones with rich sound, plush earcups, and adaptive noise cancellation.' },
      { title: 'Precision Aluminum Wireless Speaker', imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop', description: 'Compact wireless speaker with a refined aluminum finish and room-filling sound.' },
      { title: 'Retro Mechanical Bluetooth Keyboard', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop', description: 'Tactile mechanical switches, vintage-inspired keycaps, and a polished desktop profile.' },
      { title: 'Audiophile Belt-Drive Hi-Fi Turntable', imageUrl: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?q=80&w=800&auto=format&fit=crop', description: 'A considered analog setup with a low-resonance platter and precision tonearm.' },
    ],
  },
  {
    key: 'sports',
    brand: 'Lumière Active',
    items: [
      { title: 'Seamless Ribbed Compression Active Set', imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop', description: 'A sculpting performance set in four-way stretch fabric with breathable, moisture-wicking comfort.' },
      { title: 'Matte Obsidian Alignment Yoga Mat', imageUrl: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=800&auto=format&fit=crop', description: 'A cushioned, grippy yoga mat with subtle alignment guides and a refined matte finish.' },
      { title: 'Merino Wool Quarter-Zip Training Top', imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop', description: 'A lightweight training layer in soft merino blend with a practical quarter-zip collar.' },
      { title: 'Insulated Stainless Thermal Flask', imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop', description: 'Double-wall insulated stainless steel bottle designed to keep drinks at the right temperature.' },
    ],
  },
]

function categoryFromProduct(text: string): CategorySpec {
  const direct = LUXURY_CATALOG.find((category) => text.includes(category.key))
  if (direct) return direct
  if (/(shoe|boot|oxford|loafer|sneaker|pump)/.test(text)) return LUXURY_CATALOG[1]
  if (/(bag|tote|crossbody|satchel|weekender)/.test(text)) return LUXURY_CATALOG[2]
  if (/(ring|watch|pendant|earring|jewel|gold|pearl)/.test(text)) return LUXURY_CATALOG[3]
  if (/(perfume|fragrance|serum|oil|lip|beauty)/.test(text)) return LUXURY_CATALOG[4]
  if (/(vase|lamp|candle|home|decor|travertine)/.test(text)) return LUXURY_CATALOG[5]
  if (/(speaker|headphone|audio|turntable|keyboard|electronic)/.test(text)) return LUXURY_CATALOG[6]
  if (/(sport|yoga|active|training|flask)/.test(text)) return LUXURY_CATALOG[7]
  if (/(blazer|coat|dress|suit|silk|fashion|linen|cardigan)/.test(text)) return LUXURY_CATALOG[0]
  return LUXURY_CATALOG[0]
}

export function getProductDisplay(product?: {
  id?: string
  slug?: string
  title?: string
  brand?: string
  description?: string
}): CuratedProductInfo {
  const slug = (product?.slug || '').toLowerCase()
  const title = (product?.title || '').toLowerCase()
  const category = categoryFromProduct(`${slug} ${title}`)
  const numberMatch = slug.match(/\\d+/) || title.match(/\\d+/)
  const number = numberMatch ? Number.parseInt(numberMatch[0], 10) : 0
  const item = category.items[number > 0 ? (number - 1) % category.items.length : 0]
  const edition = number > category.items.length ? ` · Edition ${Math.floor((number - 1) / category.items.length) + 1}` : ''

  return {
    title: `${item.title}${edition}`,
    imageUrl: item.imageUrl,
    brand: category.brand,
    description: item.description,
  }
}

export function getProductImage(slug?: string, title?: string): string {
  return getProductDisplay({ slug, title }).imageUrl
}
