import React from 'react';
import { About } from './About';
import { Translations, AboutContent, Language } from '../types';

interface AboutPageProps {
    t: Translations;
    content?: AboutContent;
    lang?: Language;
}

export const AboutPage: React.FC<AboutPageProps> = ({ t, content, lang = 'en' }) => {
    return (
        <div className="pt-8 min-h-screen">
            <About t={t} content={content} lang={lang} />
        </div>
    );
};
