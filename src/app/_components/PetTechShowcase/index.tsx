import React from 'react'
import Link from 'next/link'
import classes from './index.module.scss'

const ADVANTAGES = [
  {
    tag: 'RESOLUTION',
    title: '300+ True DPI Sharpness',
    desc: 'Micro-droplet pigment placement creates pin-sharp vector curves, tiny typography, and photo-realistic gradients without halftone dots.',
  },
  {
    tag: 'DURABILITY',
    title: '50+ Industrial Wash Cycles',
    desc: 'Thermoplastic polyurethane (TPU) adhesive powder bonds directly into garment fibers. Zero cracking, zero fading, zero edge peeling.',
  },
  {
    tag: 'ANY MATERIAL',
    title: 'Universal Fabric Chemistry',
    desc: 'Unlike DTG (cotton-only) or Sublimation (polyester-only), PET prints flawlessly on 100% Cotton, Poly, Nylon, Canvas, and Fleece.',
  },
  {
    tag: 'NO MINIMUMS',
    title: 'Print on Demand, Zero Waste',
    desc: 'Order 1 custom bespoke sample or scale to 10,000 corporate units with dynamic volume tiered discounts.',
  },
]

const STEPS = [
  {
    number: '01',
    step: 'SELECT BLANK',
    title: 'Choose Your Foundation',
    desc: 'Select from our certified streetwear blanks: heavy French terry, boxy cut tees, raw duck canvas, or accessories.',
  },
  {
    number: '02',
    step: 'DESIGN & PROOF',
    title: 'Upload & Real-Time DPI',
    desc: 'Position graphics in our interactive canvas studio. Our smart DPI engine instantly verifies artwork clarity before printing.',
  },
  {
    number: '03',
    step: 'PRECISION PRESS',
    title: 'Direct-to-Film Heat Transfer',
    desc: 'Printed on Japanese multi-head industrial presses, heat-cured under calibrated pressure, and dispatched in 24 hours.',
  },
]

export const PetTechShowcase: React.FC = () => {
  return (
    <section id="how-it-works" className={classes.section}>
      <div className={classes.container}>
        <div className={classes.header}>
          <span className={classes.eyebrow}>DIRECT-TO-FILM ENGINEERING</span>
          <h2 className={classes.title}>Why Creators Choose PET Printing</h2>
          <p className={classes.subtitle}>
            A radical leap forward in wearable graphics. Superior to DTG and vinyl across every metric.
          </p>
        </div>

        <div className={classes.advGrid}>
          {ADVANTAGES.map((adv, idx) => (
            <div key={idx} className={classes.advCard}>
              <span className={classes.advTag}>{adv.tag}</span>
              <h3 className={classes.advTitle}>{adv.title}</h3>
              <p className={classes.advDesc}>{adv.desc}</p>
            </div>
          ))}
        </div>

        <div className={classes.processWrapper}>
          <div className={classes.processHead}>
            <span className={classes.eyebrow}>WORKFLOW</span>
            <h3 className={classes.processTitle}>From Raw Artwork to Delivered Garment</h3>
          </div>

          <div className={classes.stepsGrid}>
            {STEPS.map((s, idx) => (
              <div key={idx} className={classes.stepCard}>
                <div className={classes.stepHeader}>
                  <span className={classes.stepNumber}>{s.number}</span>
                  <span className={classes.stepTag}>{s.step}</span>
                </div>
                <h4 className={classes.stepTitle}>{s.title}</h4>
                <p className={classes.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={classes.ctaBanner}>
          <div className={classes.ctaContent}>
            <h3 className={classes.ctaHeading}>Ready to print your vision?</h3>
            <p className={classes.ctaText}>
              Launch our interactive customizer, drop your design, and experience true high-resolution PET apparel.
            </p>
            <div className={classes.ctaActions}>
              <Link href="/products" className={classes.ctaBtnPrimary}>
                Start Designing Now
              </Link>
              <Link href="/products" className={classes.ctaBtnSecondary}>
                View Blank Specs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
