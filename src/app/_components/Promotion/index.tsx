import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import classes from './index.module.scss'

const Promotion = () => {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const targetDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date
  }, [])

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const currentTime = new Date()
      const timeDifference = Math.max(Number(targetDate) - Number(currentTime), 0)

      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000)

      setTime({ days, hours, minutes, seconds })

      if (timeDifference === 0) {
        clearInterval(timerInterval)
      }
    }, 1000)

    return () => {
      clearInterval(timerInterval)
    }
  }, [targetDate])

  return (
    <section className={classes.promotion}>
      <div className={classes.box}>
        <div className={classes.textCol}>
          <span className={classes.eyebrow}>LIMITED PET LAUNCH EVENT</span>
          <h3 className={classes.title}>Complimentary A3 Front/Back Print Surcharge</h3>
          <p className={classes.desc}>
            For a limited window, enjoy zero extra print surcharges on oversized Direct-to-Film transfer prints
            across all heavyweight hoodies and boxy tees.
          </p>
          <Link href="/products" className={classes.actionBtn}>
            Claim Print Offer
          </Link>
        </div>

        <div className={classes.timerCol}>
          <span className={classes.timerLabel}>OFFER EXPIRES IN</span>
          <ul className={classes.stats}>
            <StatBox label="Days" value={time.days} />
            <StatBox label="Hours" value={time.hours} />
            <StatBox label="Mins" value={time.minutes} />
            <StatBox label="Secs" value={time.seconds} />
          </ul>
        </div>
      </div>
    </section>
  )
}

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <li className={classes.statBox}>
    <span className={classes.statVal}>{String(value).padStart(2, '0')}</span>
    <span className={classes.statSub}>{label}</span>
  </li>
)

export default Promotion
