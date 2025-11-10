import React from 'react';

const BoardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.25 0" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21a5.25 5.25 0 10-1.836-10.152 5.25 5.25 0 00-1.664 2.115M17.25 10.5a5.25 5.25 0 10-9.638-2.23 5.25 5.25 0 00-1.664 2.115" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3.75a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v16.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75z" />
    </svg>
);

export default BoardIcon;
