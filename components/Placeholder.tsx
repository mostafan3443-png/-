import React from 'react';

const Placeholder: React.FC<{ title: string }> = ({ title }) => (
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <p className="text-gray-600">این بخش در حال توسعه است.</p>
    </div>
);

export default Placeholder;
