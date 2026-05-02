import React from 'react';
import TabelBencana from '@/components/TabelBencana';

export default function App() {
    return (
        <div className="app-container">
            <header className="app-header">
                <h1>SIG Bencana Kabupaten Bekasi</h1>
                <p>Visualisasi Persebaran Kejadian Bencana — Data BPS 2025</p>
            </header>
            <main>
                <TabelBencana />
            </main>
        </div>
    );
}