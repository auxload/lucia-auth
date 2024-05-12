import { cn } from '@/lib/utils'
import React, { HTMLAttributes } from 'react'

interface SectionProp extends HTMLAttributes<HTMLDivElement> {
    
}


const Section = ({className,children}:SectionProp) => {
  return (
    <section className={cn("py-20",className)}>
      {children}
    </section>
  )
}

export default Section
