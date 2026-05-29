import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';

interface ExampleRepoCardProps {
  title: string;
  index: number;
  key?: React.Key;
}

export function ExampleRepoCard({ title, index }: ExampleRepoCardProps) {
  const navigate = useNavigate();

  const startDemo = () => {
    navigate('/analyze/loading');
  };

  return (
    <Card hoverable className="cursor-pointer group relative flex flex-col justify-between" onClick={startDemo}>
      <span className="absolute top-8 right-8 text-[6rem] text-[#27272A] leading-none group-hover:text-black/10 transition-colors font-sans pointer-events-none">
        0{index}
      </span>
      <h3 className="text-3xl font-bold uppercase mb-12 group-hover:text-black relative z-10 transition-colors">
        {title}
      </h3>
      <p className="text-[#A1A1AA] text-lg uppercase group-hover:text-black/80 relative z-10 transition-colors">
        Click to view demo analysis
      </p>
    </Card>
  );
}
