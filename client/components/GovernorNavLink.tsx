import React from 'react';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GovernorNavLink = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/governor/dashboard')}
      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Crown className="w-4 h-4 mr-2" />
      Governor Dashboard
    </Button>
  );
};

export default GovernorNavLink;
