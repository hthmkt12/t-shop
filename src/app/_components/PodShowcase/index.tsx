import React from 'react'

import { Button } from '../Button'
import { Gutter } from '../Gutter'

import classes from './index.module.scss'

const valueProps = [
  {
    icon: '↑',
    title: 'Upload your art free',
    text: 'Drop in any design and preview it on live mockups. No setup fees, ever.',
  },
  {
    icon: '✓',
    title: 'Premium print quality',
    text: 'Durable, vivid prints on ethically sourced blanks that last wash after wash.',
  },
  {
    icon: '⚡',
    title: 'Made on demand',
    text: 'We print only what is ordered. No inventory, no waste, no minimums.',
  },
  {
    icon: '✈',
    title: 'Worldwide shipping',
    text: 'Produced close to your customers and shipped fast, wherever they are.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Pick a product',
    text: 'Choose from tees, hoodies, mugs, totes, posters and more blank canvases.',
  },
  {
    num: '02',
    title: 'Add your design',
    text: 'Upload artwork, position it, and see it rendered on a realistic mockup.',
  },
  {
    num: '03',
    title: 'We print & ship',
    text: 'Once an order lands we produce it and deliver straight to the buyer.',
  },
]

export const PodShowcase: React.FC = () => {
  return (
    <Gutter>
      <div className={classes.showcase}>
        <div className={classes.valueProps}>
          {valueProps.map(prop => (
            <div key={prop.title} className={classes.prop}>
              <div className={classes.propIcon} aria-hidden="true">
                {prop.icon}
              </div>
              <p className={classes.propTitle}>{prop.title}</p>
              <p className={classes.propText}>{prop.text}</p>
            </div>
          ))}
        </div>

        <div className={classes.section}>
          <div className={classes.sectionHead}>
            <p className={classes.eyebrow}>How it works</p>
            <h2 className={classes.sectionTitle}>From idea to doorstep in three steps</h2>
            <p className={classes.sectionSub}>
              Design once, sell everywhere. We handle printing, packing and fulfilment.
            </p>
          </div>

          <div className={classes.steps}>
            {steps.map(step => (
              <div key={step.num} className={classes.step}>
                <div className={classes.stepNum}>{step.num}</div>
                <p className={classes.stepTitle}>{step.title}</p>
                <p className={classes.stepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={classes.cta}>
          <h2 className={classes.ctaTitle}>Turn your ideas into products people wear</h2>
          <p className={classes.ctaSub}>
            Start with a blank, add your design, and launch your print-on-demand store today.
          </p>
          <div className={classes.ctaActions}>
            <Button
              label="Start designing"
              href="/products"
              appearance="primary"
              invert
              el="link"
            />
            <Button
              label="Browse products"
              href="/products"
              appearance="secondary"
              invert
              el="link"
            />
          </div>
        </div>
      </div>
    </Gutter>
  )
}
