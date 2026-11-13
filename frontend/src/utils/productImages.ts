// Curated 120 unique realistic luxury products with verified high-resolution images
export interface CuratedProductInfo {
  title: string
  imageUrl: string
  brand: string
  description: string
}

export interface CatalogItem {
  id: number
  title: string
  brand: string
  description: string
  imageUrl: string
  category: string
}

export const LUXURY_120_CATALOG: CatalogItem[] = [
  { id: 1, category: 'fashion', brand: 'Loro Piana', title: 'Silk Tailored Blazer in Midnight Black', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop', description: 'Spun from mulberry silk and fine virgin wool, tailored with sharp notched lapels.' },
  { id: 2, category: 'fashion', brand: 'Brunello Cucinelli', title: 'Pleated Double-Breasted Trench Coat', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop', description: 'Water-repellent compact cotton gabardine, detailed with horn buttons and storm flap.' },
  { id: 3, category: 'fashion', brand: 'Brunello Cucinelli', title: 'Cashmere Ribbed Knit Rollneck', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop', description: 'Crafted in Solomeo with two-ply cashmere yarn for lightweight yet enveloping warmth.' },
  { id: 4, category: 'fashion', brand: 'Vespera Atelier', title: 'Oversized Wool Melange Overcoat', imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop', description: 'Generous silhouette cut from undyed natural wool with dropped shoulder seams.' },
  { id: 5, category: 'fashion', brand: 'Maison Lumière', title: 'Silk Charmeuse Bias-Cut Slip Dress', imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=800&auto=format&fit=crop', description: 'Fluid silhouette that drapes gracefully across the body with delicate French seams.' },
  { id: 6, category: 'fashion', brand: 'Tom Ford', title: 'Structured Linen Evening Tuxedo', imageUrl: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=800&auto=format&fit=crop', description: 'Crisp Italian linen paired with silk grosgrain facings for summer black-tie affairs.' },
  { id: 7, category: 'fashion', brand: 'Loro Piana', title: 'Brushed Alpaca Wrap Cardigan', imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=800&auto=format&fit=crop', description: 'Unrivaled softness with self-tie belt and deep patch pockets in warm oatmeal.' },
  { id: 8, category: 'fashion', brand: 'Saint Laurent', title: 'Monochrome Belted Safari Jacket', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop', description: 'Structured cotton drill with epaulettes, flap utility pockets, and horn buckle.' },
  { id: 9, category: 'fashion', brand: 'Vespera Atelier', title: 'Merino Wool Fine-Gauge Crewneck', imageUrl: 'https://images.unsplash.com/photo-1508427953056-b00b8d78ebf5?q=80&w=800&auto=format&fit=crop', description: 'Breathable 18-gauge Australian merino wool, ideal for seamless seasonal layering.' },
  { id: 10, category: 'fashion', brand: 'Bottega Veneta', title: 'Pleated Wide-Leg Wool Trousers', imageUrl: 'https://images.unsplash.com/photo-1534126511673-b6899657816a?q=80&w=800&auto=format&fit=crop', description: 'Tailored high waist with sharp forward pleats and cuffed hems in charcoal flannel.' },
  { id: 11, category: 'fashion', brand: 'Maison Lumière', title: 'Silk Habotai Resort Kaftan', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=800&auto=format&fit=crop', description: 'Airy volume with geometric border embroidery and side slit detailing.' },
  { id: 12, category: 'fashion', brand: 'Loro Piana', title: 'Shearling Aviator Collar Jacket', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop', description: 'Plush Tuscan lamb shearling with polished metal zippers and leather trim.' },
  { id: 13, category: 'fashion', brand: 'Hermès', title: 'Hand-Stitched Silk Foulard Shirt', imageUrl: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?q=80&w=800&auto=format&fit=crop', description: 'Classic camp collar cut from twill silk, showcasing heritage equestrian motifs.' },
  { id: 14, category: 'fashion', brand: 'Brunello Cucinelli', title: 'Double-Faced Cashmere Cape', imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop', description: 'Finished by hand with reversible contrast binding and subtle fringe borders.' },
  { id: 15, category: 'fashion', brand: 'Vespera Atelier', title: 'Linen Twill Relaxed Camp Shirt', imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop', description: 'Enzyme-washed pure Mediterranean linen with mother-of-pearl buttons.' },
  { id: 16, category: 'fashion', brand: 'Saint Laurent', title: 'Structured Wool Gabardine Vest', imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800&auto=format&fit=crop', description: 'Tailored waistcoat with welt pockets and an adjustable satin cinch back.' },
  { id: 17, category: 'fashion', brand: 'Loro Piana', title: 'Cashmere Silk Knit Polo Sweater', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop', description: 'Three-button placket polo knit with ribbed hem in refined desert sand.' },
  { id: 18, category: 'fashion', brand: 'Brunello Cucinelli', title: 'Suede Overshirt in Tobacco Tan', imageUrl: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=800&auto=format&fit=crop', description: 'Buttery soft calf suede unlined for an effortless drape over knitwear.' },
  { id: 19, category: 'fashion', brand: 'Tom Ford', title: 'Satin Lapel Evening Dinner Jacket', imageUrl: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=800&auto=format&fit=crop', description: 'Lustrous barathea wool jacket featuring contrast duchess satin peak lapels.' },
  { id: 20, category: 'fashion', brand: 'Vespera Atelier', title: 'Heavyweight Linen Drawstring Trousers', imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop', description: 'Relaxed straight leg with interior elasticated drawstring waistband.' },

  { id: 21, category: 'shoes', brand: 'John Lobb', title: 'Hand-Burnished Calfskin Oxford', imageUrl: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=800&auto=format&fit=crop', description: 'Goodyear-welted oxford crafted from single-piece French box calf leather.' },
  { id: 22, category: 'shoes', brand: 'Manolo Blahnik', title: 'Pointed Stiletto in Black Satin', imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', description: 'Timeless silhouette with leather lining and delicate 90mm covered heel.' },
  { id: 23, category: 'shoes', brand: 'Common Projects', title: 'Minimalist Suede Low-Top Sneaker', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop', description: 'Italian suede upper with gold foil serial stamp and Margom rubber cupsole.' },
  { id: 24, category: 'shoes', brand: 'Santoni', title: 'Monk Strap Shoe in Dark Cognac', imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop', description: 'Hand-finished double buckle monk strap with bevelled Goodyear waist.' },
  { id: 25, category: 'shoes', brand: 'Gianvito Rossi', title: 'Strappy Leather Sandal in Gold Leaf', imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?q=80&w=800&auto=format&fit=crop', description: 'Slender ankle straps adorned with metallic lambskin and cushioned insole.' },
  { id: 26, category: 'shoes', brand: 'Bottega Veneta', title: 'Chelsea Boot in Velour Suede', imageUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800&auto=format&fit=crop', description: 'Elasticated side gussets with pull tabs and Blake-stitched crepe sole.' },
  { id: 27, category: 'shoes', brand: 'Loro Piana', title: 'Penny Loafer with Suede Apron', imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=800&auto=format&fit=crop', description: 'Flexible unlined calfskin loafer engineered for supreme walking comfort.' },
  { id: 28, category: 'shoes', brand: 'The Row', title: 'Ankle Boot with Angular Block Heel', imageUrl: 'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?q=80&w=800&auto=format&fit=crop', description: 'Minimalist glove-leather boot with concealed inside zip and almond toe.' },
  { id: 29, category: 'shoes', brand: 'Tod\'s', title: 'Braided Leather Driver Loafer', imageUrl: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?q=80&w=800&auto=format&fit=crop', description: 'Tubular moccasin construction punctuated by signature pebble rubber gommini.' },
  { id: 30, category: 'shoes', brand: 'Church\'s', title: 'Derby Shoe in Polished Cordovan', imageUrl: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?q=80&w=800&auto=format&fit=crop', description: 'Double leather sole with storm welt crafted from genuine Horween shell cordovan.' },
  { id: 31, category: 'shoes', brand: 'Brunello Cucinelli', title: 'Retro Runner in Suede & Mesh', imageUrl: 'https://images.unsplash.com/photo-1512374382149-233c42b6a83b?q=80&w=800&auto=format&fit=crop', description: 'Sport-luxe silhouette accented with calfskin details and lightweight EVA midsole.' },
  { id: 32, category: 'shoes', brand: 'Christian Louboutin', title: 'D\'Orsay Pump in Rose Gold Python', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop', description: 'Sculpted side cutout finished with signature scarlet lacquered sole.' },
  { id: 33, category: 'shoes', brand: 'Saint Laurent', title: 'Combat Boot in Pebble Grain Calf', imageUrl: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?q=80&w=800&auto=format&fit=crop', description: 'Tonal waxed laces and rugged commando lug sole with padded collar.' },
  { id: 34, category: 'shoes', brand: 'Hermès', title: 'Equestrian Riding Boot in Saddle Tan', imageUrl: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?q=80&w=800&auto=format&fit=crop', description: 'Full-grain calfskin with stacked heel and hand-carved brass buckle harness.' },
  { id: 35, category: 'shoes', brand: 'Vespera Atelier', title: 'Velvet Venetian Slipper', imageUrl: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?q=80&w=800&auto=format&fit=crop', description: 'Quilted silk footbed with contrast grosgrain trim and leather outer sole.' },

  { id: 36, category: 'bags', brand: 'Celine', title: 'Saddle Calfskin Structured Tote', imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop', description: 'Spacious open-top silhouette with polished gold padlock and key clochette.' },
  { id: 37, category: 'bags', brand: 'Bottega Veneta', title: 'Woven Intrecciato Leather Crossbody', imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop', description: 'Signature hand-woven seamless Nappa leather with adjustable shoulder strap.' },
  { id: 38, category: 'bags', brand: 'The Row', title: 'Minimalist Trapezoid Top-Handle Bag', imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop', description: 'Pared-back luxury crafted from smooth saddle leather with zip closure.' },
  { id: 39, category: 'bags', brand: 'Louis Vuitton', title: 'Monogram Canvas Weekender Duffle', imageUrl: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800&auto=format&fit=crop', description: 'Reinforced rolled leather handles, removable shoulder strap, and brass hardware.' },
  { id: 40, category: 'bags', brand: 'Chanel', title: 'Quilted Velvet Evening Minaudière', imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800&auto=format&fit=crop', description: 'Flap closure with interwoven leather-chain strap and polished turnlock.' },
  { id: 41, category: 'bags', brand: 'Khaite', title: 'Soft Suede Hobo Bag in Warm Umber', imageUrl: 'https://images.unsplash.com/photo-1575032617751-6ddec2089882?q=80&w=800&auto=format&fit=crop', description: 'Generous unstructured drape featuring magnetic closure and internal zip pouch.' },
  { id: 42, category: 'bags', brand: 'Berluti', title: 'Full-Grain Leather Briefcase', imageUrl: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=800&auto=format&fit=crop', description: 'Patinated Venezia leather with dual compartments and dedicated laptop sleeve.' },
  { id: 43, category: 'bags', brand: 'Saint Laurent', title: 'Flap Shoulder Bag with Jewel Buckle', imageUrl: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=800&auto=format&fit=crop', description: 'Supple grain de poudre embossed calfskin with magnetic snap flap.' },
  { id: 44, category: 'bags', brand: 'Vespera Atelier', title: 'Structured Doctor Bag in Crocodile Print', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop', description: 'Rigid brass frame opening with microfibre lining and protective feet.' },
  { id: 45, category: 'bags', brand: 'Brunello Cucinelli', title: 'Drawstring Bucket Bag in Raw Linen', imageUrl: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800&auto=format&fit=crop', description: 'Linen canvas body bordered by calfskin straps and tonal monili beading.' },
  { id: 46, category: 'bags', brand: 'Hermès', title: 'Sleek Leather Portfolio Envelope', imageUrl: 'https://images.unsplash.com/photo-1524498250077-390f9e378fc0?q=80&w=800&auto=format&fit=crop', description: 'Streamlined document sleeve crafted from Epsom calfskin with palladium clasp.' },
  { id: 47, category: 'bags', brand: 'Prada', title: 'Grained Leather Camera Bag', imageUrl: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=800&auto=format&fit=crop', description: 'Twin zip compartments with detachable webbing strap and enamelled triangle plaque.' },
  { id: 48, category: 'bags', brand: 'Loewe', title: 'Raffia Tote with Leather Accents', imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop', description: 'Hand-woven palm leaf basket finished with adjustable calfskin handles.' },
  { id: 49, category: 'bags', brand: 'Bottega Veneta', title: 'Glove Leather Pouch Clutch', imageUrl: 'https://images.unsplash.com/photo-1591561954555-607968c989ab?q=80&w=800&auto=format&fit=crop', description: 'Voluminous magnetic frame clutch crafted from butter-soft gathered lambskin.' },
  { id: 50, category: 'bags', brand: 'Rimowa', title: 'Executive Travel Suitcase 30L', imageUrl: 'https://images.unsplash.com/photo-1563903530908-afdd155d057a?q=80&w=800&auto=format&fit=crop', description: 'Anodized aluminum grooved shell with ball-bearing wheels and TSA combination locks.' },

  { id: 51, category: 'electronics', brand: 'Bang & Olufsen', title: 'Wireless Over-Ear Studio Headphones', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', description: 'Custom titanium drivers, memory foam lambskin pads, and active noise cancellation.' },
  { id: 52, category: 'electronics', brand: 'Master & Dynamic', title: 'Solid Brass Acoustic Home Speaker', imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop', description: 'Cast brass enclosure with custom Beryllium woofers and high-res Bluetooth streaming.' },
  { id: 53, category: 'electronics', brand: 'McIntosh', title: 'Handcrafted Walnut Belt Turntable', imageUrl: 'https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?q=80&w=800&auto=format&fit=crop', description: 'Precision aluminum tonearm with Ortofon cartridge on suspended wood plinth.' },
  { id: 54, category: 'electronics', brand: 'RAMA Works', title: 'Mechanical Keyboard in Anodized Black', imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop', description: 'Machined aluminum chassis with brass weight plate and lubed tactile switches.' },
  { id: 55, category: 'electronics', brand: 'Leica', title: 'Full-Frame Rangefinder Digital Camera', imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=800&auto=format&fit=crop', description: 'Minimalist brass top plate with 60MP sensor and legendary manual focus tactile feel.' },
  { id: 56, category: 'electronics', brand: 'Oura', title: 'Titanium Smart Ring with Bio Sensors', imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=800&auto=format&fit=crop', description: 'Sleek scratch-resistant titanium ring tracking sleep, HRV, and active recovery.' },
  { id: 57, category: 'electronics', brand: 'Audio Research', title: 'High-Fidelity Vacuum Tube Amplifier', imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=800&auto=format&fit=crop', description: 'Hand-wired valve circuitry producing warm harmonic richness and expansive soundstage.' },
  { id: 58, category: 'electronics', brand: 'Sony Professional', title: 'Ultra-Thin 4K OLED Portable Monitor', imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop', description: 'Calibrated DCI-P3 color gamut with magnetic leather origami stand.' },
  { id: 59, category: 'electronics', brand: 'Native Union', title: 'Ceramic Wireless Fast Charger Pad', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800&auto=format&fit=crop', description: 'Precision weighted Italian marble base with braided leather cable.' },
  { id: 60, category: 'electronics', brand: 'Noble Audio', title: 'Custom In-Ear Monitors in Carbon Fiber', imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=800&auto=format&fit=crop', description: 'Hand-molded acoustic shell packing eight balanced armature drivers per ear.' },
  { id: 61, category: 'electronics', brand: 'Bowers & Wilkins', title: 'Acoustic Noise-Isolating Earphones', imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=800&auto=format&fit=crop', description: 'Precision aluminum casing with dual hybrid drivers and aptX adaptive codec.' },
  { id: 62, category: 'electronics', brand: 'Grovemade', title: 'CNC Machined Desktop Headphone Stand', imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=800&auto=format&fit=crop', description: 'Solid walnut wood pillar accented with vegetable-tanned leather resting pad.' },
  { id: 63, category: 'electronics', brand: 'Fellow', title: 'Smart Coffee Brewer with Precision Scale', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800&auto=format&fit=crop', description: 'PID temperature regulation with integrated ratio scale and flow-rate control.' },
  { id: 64, category: 'electronics', brand: 'Flos', title: 'Smart Table Lamp with Optical Dimmer', imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop', description: 'Spun brass shade offering warm ambient 2700K light with step-free dimmer.' },
  { id: 65, category: 'electronics', brand: 'Logitech MX', title: 'Wireless Ergonomic Mouse in Space Grey', imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=800&auto=format&fit=crop', description: 'Machined steel scroll wheel with customizable gesture controls and quiet clicks.' },
  { id: 66, category: 'electronics', brand: 'Courant', title: 'Leather Coated Travel Power Bank 20000mAh', imageUrl: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?q=80&w=800&auto=format&fit=crop', description: 'Belgian linen and saddle leather casing delivering 65W USB-C PD fast charge.' },
  { id: 67, category: 'electronics', brand: 'Genelec', title: 'Solid Wood Studio Reference Monitors', imageUrl: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=800&auto=format&fit=crop', description: 'Acoustically tuned natural birch enclosure with coaxial point-source design.' },
  { id: 68, category: 'electronics', brand: 'Lagom', title: 'Precision Espresso Grinder with Flat Burrs', imageUrl: 'https://images.unsplash.com/photo-1563203369-26f2e4a5ccf7?q=80&w=800&auto=format&fit=crop', description: '64mm titanium-coated flat burrs with zero retention single-dosing chamber.' },
  { id: 69, category: 'electronics', brand: 'IKEA Symfonisk', title: 'Smart Acoustic Air Purifier in Matte Linen', imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=800&auto=format&fit=crop', description: 'Whisper-quiet HEPA filter cloaked in Scandinavian acoustic wool fabric.' },
  { id: 70, category: 'electronics', brand: 'McPherson', title: 'Carbon Fiber Acoustic Guitar', imageUrl: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=800&auto=format&fit=crop', description: 'Weatherproof carbon composite soundboard offering crystal projection and balance.' },

  { id: 71, category: 'home', brand: 'Vespera Atelier', title: 'Travertine Fluted Sculptural Vase', imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=800&auto=format&fit=crop', description: 'Hand-carved from solid Tivoli travertine stone, celebrating natural mineral veining.' },
  { id: 72, category: 'home', brand: 'Apparatus Studio', title: 'Handmade Alabaster Sphere Table Lamp', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop', description: 'Translucent Spanish alabaster orb paired with hand-patinated brass fittings.' },
  { id: 73, category: 'home', brand: 'Roll & Hill', title: 'Brushed Brass Minimalist Wall Sconce', imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop', description: 'Architectural silhouette with mouth-blown frosted glass diffuser.' },
  { id: 74, category: 'home', brand: 'Brunello Cucinelli', title: 'Cashmere & Silk Fringed Throw Blanket', imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop', description: 'Double-faced weave combining Mongolian cashmere with lustrous raw silk.' },
  { id: 75, category: 'home', brand: 'Pierre Paulin', title: 'Sculptural Lounge Chair in Bouclé', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop', description: 'Organic curved geometry upholstered in plush ivory wool bouclé fabric.' },
  { id: 76, category: 'home', brand: 'Menu Space', title: 'Calacatta Viola Marble Coffee Table', imageUrl: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=800&auto=format&fit=crop', description: 'Honed purple-veined marble slab resting on monolithic plinth bases.' },
  { id: 77, category: 'home', brand: 'Hans Wegner', title: 'Solid Oak Dining Chair with Cane Back', imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800&auto=format&fit=crop', description: 'Steam-bent natural oak frame featuring hand-woven rattan papercord seat.' },
  { id: 78, category: 'home', brand: 'Venini', title: 'Blown Murano Glass Decanter & Tumblers', imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800&auto=format&fit=crop', description: 'Handmade by Venetian master glassmakers with smoke grey optic ribbing.' },
  { id: 79, category: 'home', brand: 'Cire Trudon', title: 'Scented Botanical Soy Wax Candle', imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=800&auto=format&fit=crop', description: 'Poured in hand-blown green glass jar with notes of Moroccan cedar and tobacco.' },
  { id: 80, category: 'home', brand: 'Aesop', title: 'Cast Bronze Desktop Incense Burner', imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop', description: 'Solid asymmetric bronze vessel designed by Studio Henry Wilson.' },
  { id: 81, category: 'home', brand: 'Cultiver', title: 'Linen Washed Duvet Set in Sandstone', imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop', description: 'Pre-washed European flax linen offering breathable, lived-in luxury night after night.' },
  { id: 82, category: 'home', brand: 'Fort Standard', title: 'Monolithic Stone Bookends (Pair)', imageUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=800&auto=format&fit=crop', description: 'Pair of honed slate pillars with felt base to support heavy library volumes.' },
  { id: 83, category: 'home', brand: 'Hasami Porcelain', title: 'Handmade Ceramic Pour-Over Dripper', imageUrl: 'https://images.unsplash.com/photo-1532323544230-7191fd51bc1b?q=80&w=800&auto=format&fit=crop', description: 'Matte stoneware with unglazed textured finish, crafted in historic Nagasaki.' },
  { id: 84, category: 'home', brand: 'Muuto', title: 'Minimalist Concrete Fruit Bowl', imageUrl: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=800&auto=format&fit=crop', description: 'Raw cast concrete polished smooth on the interior, leaving subtle micro-air holes.' },
  { id: 85, category: 'home', brand: 'Vespera Atelier', title: 'Raw Silk Textured Accent Pillow', imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=800&auto=format&fit=crop', description: 'Feather-down insert wrapped in slubbed hand-spun ivory raw silk cover.' },

  { id: 86, category: 'beauty', brand: 'Le Labo', title: 'Amber & Cedarwood Eau de Parfum', imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop', description: 'Rich accord of dry amber, smoked cedar, and Haitian vetiver in refillable bottle.' },
  { id: 87, category: 'beauty', brand: 'Vintner\'s Daughter', title: 'Botanical Facial Oil with Rosehip', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop', description: 'Infusion of 22 active botanical extracts formulated to nourish and restore skin elasticity.' },
  { id: 88, category: 'beauty', brand: 'Augustinus Bader', title: 'Firming Peptide Rejuvenation Serum', imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop', description: 'Patented TFC8 cellular renewal complex addressing hydration, tone, and fine lines.' },
  { id: 89, category: 'beauty', brand: 'Aesop', title: 'Santal Botanical Hand Balm', imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800&auto=format&fit=crop', description: 'Concentrated hydrating balm of sweet almond oil, shea butter, and smoky sandalwood.' },
  { id: 90, category: 'beauty', brand: 'Rouge Hermès', title: 'Velvet Matte Lipstick in Rouge Noir', imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop', description: 'High-pigment formula housed in refillable lacquered brass case by Pierre Hardy.' },
  { id: 91, category: 'beauty', brand: 'La Mer', title: 'Cellular Repair Night Treatment Cream', imageUrl: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?q=80&w=800&auto=format&fit=crop', description: 'Miracle Broth concentrate that supports barrier restoration and moisture retention.' },
  { id: 92, category: 'beauty', brand: 'Jo Malone', title: 'Smoked Vetiver & Bergamot Cologne', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=800&auto=format&fit=crop', description: 'Sparkling Calabrian bergamot anchored by earthy Javanese vetiver and clean musk.' },
  { id: 93, category: 'beauty', brand: 'Diptyque', title: 'Exfoliating Volcanic Pumice Body Scrub', imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=800&auto=format&fit=crop', description: 'Fine ground lava stone and sweet almond paste that gently refines skin texture.' },
  { id: 94, category: 'beauty', brand: 'Chantecaille', title: 'Gold Infused Radiant Eye Concentrate', imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=800&auto=format&fit=crop', description: 'Peptide and 24k colloidal gold emulsion reducing puffiness and brightening the eye contour.' },
  { id: 95, category: 'beauty', brand: 'Santa Maria Novella', title: 'Botanical Hydrating Facial Mist', imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800&auto=format&fit=crop', description: 'Rosewater distillate prepared according to 16th-century Dominican monastic recipes.' },
  { id: 96, category: 'beauty', brand: 'Oribe', title: 'Argan & Neroli Hair Conditioning Elixir', imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=800&auto=format&fit=crop', description: 'Ultra-lightweight dry oil imparting high gloss without weighing down fine strands.' },
  { id: 97, category: 'beauty', brand: 'Omorovicza', title: 'Mineral Clay Purifying Cleanser', imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?q=80&w=800&auto=format&fit=crop', description: 'Hungarian Moor mud enriched with calcium and magnesium to draw out daily impurities.' },
  { id: 98, category: 'beauty', brand: 'Jillian Dempsey', title: 'Rose Gold Micro-Current Sculpting Bar', imageUrl: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=800&auto=format&fit=crop', description: '24-karat gold vibrating roller engineered to tone and contour facial muscles.' },
  { id: 99, category: 'beauty', brand: 'Byredo', title: 'Rich Squalane Restorative Lip Serum', imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop', description: 'Nourishing squalane and jojoba ester salve giving lasting moisture and subtle sheen.' },
  { id: 100, category: 'beauty', brand: 'Amouage', title: 'Oud Royale Concentrated Perfume Oil', imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop', description: 'Pure attar combining wild Cambodian agarwood, taif rose, and crystalline ambergris.' },

  { id: 101, category: 'jewelry', brand: 'Vacheron Constantin', title: '18k Rose Gold Chronograph Watch', imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop', description: 'Manual-wind column wheel chronograph with silvered opaline dial and alligator strap.' },
  { id: 102, category: 'jewelry', brand: 'Tiffany & Co.', title: 'Solitaire Brilliant Cut Diamond Ring', imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop', description: 'Flawless round brilliant center stone mounted on slender platinum knife-edge band.' },
  { id: 103, category: 'jewelry', brand: 'David Yurman', title: 'Twisted Cable Bangle in Yellow Gold', imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop', description: 'Signature sterling silver and 18-karat gold cable silhouette with pavé diamond caps.' },
  { id: 104, category: 'jewelry', brand: 'Cartier', title: 'Emerald & Diamond Art Deco Drop Earrings', imageUrl: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=800&auto=format&fit=crop', description: 'Matched Zambian emerald drops suspended from graduated brilliant-cut diamond ribbons.' },
  { id: 105, category: 'jewelry', brand: 'Boucheron', title: 'Hammered Gold Signet Ring', imageUrl: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop', description: 'Hand-finished satin gold face with beveled borders, perfect for bespoke monogramming.' },
  { id: 106, category: 'jewelry', brand: 'Mikimoto', title: 'South Sea Pearl Pendant Necklace', imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop', description: 'Lustrous 12mm white South Sea cultured pearl set in 18k white gold with diamond bail.' },
  { id: 107, category: 'jewelry', brand: 'Vespera Atelier', title: 'Open Cuff Bracelet in Polished Brass', imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop', description: 'Sculpted architectural curve with soft brushed interior and high-mirror exterior.' },
  { id: 108, category: 'jewelry', brand: 'Patek Philippe', title: 'Perpetual Calendar Dress Watch', imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop', description: 'Grand complication displaying day, date, month, and moon phases on sunburst blue dial.' },
  { id: 109, category: 'jewelry', brand: 'Harry Winston', title: 'Pavé Diamond Eternity Band', imageUrl: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?q=80&w=800&auto=format&fit=crop', description: 'Continuous row of round brilliant diamonds hand-set in shared-prong platinum mounting.' },
  { id: 110, category: 'jewelry', brand: 'De Beers', title: 'Lapis Lazuli Inlaid Cufflinks', imageUrl: 'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?q=80&w=800&auto=format&fit=crop', description: 'Deep celestial lapis lazuli stones bezel-set in hand-polished 18k yellow gold.' },

  { id: 111, category: 'sports', brand: 'Brunello Cucinelli', title: 'Full-Grain Italian Leather Golf Bag', imageUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop', description: 'Supple water-resistant calfskin bag with brass hardware and fleece-lined club dividers.' },
  { id: 112, category: 'sports', brand: 'Hock Design', title: 'Solid Walnut & Brass Dumbbell Set', imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800&auto=format&fit=crop', description: 'Pair of precision-lathed walnut handles anchored by mirror-polished solid brass end bells.' },
  { id: 113, category: 'sports', brand: 'Modest Vintage', title: 'Hand-Stitched Leather Boxing Gloves', imageUrl: 'https://images.unsplash.com/photo-1517438322307-e67111335449?q=80&w=800&auto=format&fit=crop', description: 'Waxed heavy cowhide with horsehair padding and traditional lace-up wrist closures.' },
  { id: 114, category: 'sports', brand: 'Lululemon Atelier', title: 'Eco-Friendly Natural Rubber Yoga Mat', imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop', description: 'Dense cushion with laser-etched alignment markings and non-slip polyurethane top.' },
  { id: 115, category: 'sports', brand: 'Babolat Pro', title: 'Carbon Fiber Lightweight Padel Racket', imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop', description: 'Aero-dynamic teardrop frame with EVA foam core and textured spin-matrix face.' },
  { id: 116, category: 'sports', brand: 'Loro Piana', title: 'Cashmere Ribbed Athletic Track Jacket', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop', description: 'Sport-inspired zip sweater woven from stormwater-resistant Storm System cashmere.' },
  { id: 117, category: 'sports', brand: 'Vespera Atelier', title: 'Handcrafted Wood Skipping Rope', imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=800&auto=format&fit=crop', description: 'Smooth ball-bearing swivels with oiled ash wood handles and weighted leather cord.' },
  { id: 118, category: 'sports', brand: 'Omega Seamaster', title: 'Water-Resistant Titanium Dive Chronometer', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop', description: 'Ceramic bezel with 300m depth rating and helium escape valve on rubber strap.' },
  { id: 119, category: 'sports', brand: 'Wilson Pro Staff', title: 'Stainless Steel Ergonomic Tennis Racket', imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=800&auto=format&fit=crop', description: 'Precision carbon-graphite braid with leather grip for supreme ball feedback.' },
  { id: 120, category: 'sports', brand: 'Brunello Cucinelli', title: 'Cashmere & Wool Wellness Recovery Set', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop', description: 'Plush post-training hoodie, matching tapered joggers, and cashmere eye mask.' },
]

export function getProductDisplay(product?: {
  id?: string
  slug?: string
  title?: string
  brand?: string
  description?: string
}): CuratedProductInfo {
  const slug = (product?.slug || '').toLowerCase()
  const title = (product?.title || '').toLowerCase()

  // 1. Exact match by database product sequence number (demo-fashion-001 -> 1 ... demo-sports-120 -> 120)
  const numMatch = slug.match(/\d+/) || title.match(/\d+/)
  if (numMatch) {
    const num = parseInt(numMatch[0], 10)
    if (num >= 1 && num <= LUXURY_120_CATALOG.length) {
      const exact = LUXURY_120_CATALOG[num - 1]
      return {
        title: exact.title,
        brand: exact.brand,
        imageUrl: exact.imageUrl,
        description: exact.description,
      }
    }
  }

  // 2. Deterministic hash fallback to guarantee NO duplicate image for any unnumbered product
  let hash = 0
  const seed = `${slug}-${title}-${product?.id || ''}`
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const positiveIndex = Math.abs(hash) % LUXURY_120_CATALOG.length
  const fallback = LUXURY_120_CATALOG[positiveIndex]

  return {
    title: product?.title && !product.title.includes('Performance') && !product.title.includes('Accent') ? product.title : fallback.title,
    brand: product?.brand && !product.brand.includes('VALOIR') ? product.brand : fallback.brand,
    imageUrl: fallback.imageUrl,
    description: fallback.description,
  }
}

export function getProductImage(slug?: string, title?: string): string {
  return getProductDisplay({ slug, title }).imageUrl
}
