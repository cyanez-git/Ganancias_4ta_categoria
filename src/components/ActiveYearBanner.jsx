import React from 'react';
import './ActiveYearBanner.css';

export default function ActiveYearBanner({ year }) {
    if (!year) return null;

    return (
        <div className="active-year-banner">
            ⚠️ TRABAJANDO CON PERIODO FISCAL {year} ⚠️
        </div>
    );
}
