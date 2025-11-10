import React from 'react';

const UserGroupIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.25 0m-5.25 0a3.75 3.75 0 00-5.25 0M3 13.239l3.823-3.823c.373-.373.881-.586 1.414-.586h4.526c.532 0 1.04-.213 1.414-.586L18 9.239M3 13.239v2.817c0 .621.504 1.125 1.125 1.125h16.75A1.125 1.125 0 0021 16.056v-2.817M3 13.239l3.823-3.823c.373-.373.881-.586 1.414-.586h4.526" />
    </svg>
);

export default UserGroupIcon;