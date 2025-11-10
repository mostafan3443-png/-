import React from 'react';

const InKindIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25v-8.25M12 4.875A2.625 2.625 0 1012 10.125 2.625 2.625 0 0012 4.875z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 11.25c0-1.036-.84-1.875-1.875-1.875h-11.25c-1.036 0-1.875.84-1.875 1.875v8.25c0 1.036.84 1.875 1.875 1.875h11.25c1.036 0 1.875-.84 1.875-1.875v-8.25z" />
    </svg>
);

export default InKindIcon;
