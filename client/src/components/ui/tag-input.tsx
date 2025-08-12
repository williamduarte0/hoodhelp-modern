import React, { useState } from 'react';
import { Input } from './input';
import { Button } from './button';
import { Badge } from './badge';
import { Plus, X } from 'lucide-react';

interface TagInputProps {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  placeholder,
  value = [],
  onChange,
  className = ''
}) => {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !value.includes(newTag.trim())) {
      onChange([...value, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag: string, index: number) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 hover:text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddTag}
          disabled={!newTag.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
