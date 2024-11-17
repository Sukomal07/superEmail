import React from 'react'
import Mail from '../../components/mail/mail'

export default function Page() {
    return (
        <Mail
            defaultCollapsed={false}
            navCollapsedSize={4}
            defaultLayout={[20, 32, 48]}
        />
    )
}
