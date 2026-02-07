
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImportantConsiderationsSection = ({ data = [], onChange }) => {
  const [newPoint, setNewPoint] = useState('');

  const handleAddPoint = () => {
    if (newPoint.trim()) {
      onChange([...data, { id: Date.now(), text: newPoint }]);
      setNewPoint('');
    }
  };

  const handleRemovePoint = (id) => {
    onChange(data.filter(point => point.id !== id));
  };

  const handleUpdatePoint = (id, text) => {
    onChange(data.map(point => point.id === id ? { ...point, text } : point));
  };

  return (
    <div className="border border-amber-100 rounded-lg p-4 mb-4 bg-white shadow-sm">
      <h4 className="font-bold text-amber-800 mb-4">Important Considerations</h4>

      <div className="space-y-3 mb-4">
        {data.map((point, index) => (
          <div key={point.id || index} className="flex items-start gap-2 bg-amber-50 p-3 rounded border border-amber-100">
            <textarea
              value={point.text}
              onChange={(e) => handleUpdatePoint(point.id, e.target.value)}
              className="flex-1 px-3 py-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none resize-none"
              rows="2"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemovePoint(point.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <textarea
          value={newPoint}
          onChange={(e) => setNewPoint(e.target.value)}
          placeholder="Add a new consideration point..."
          className="flex-1 px-3 py-2 border border-amber-200 rounded text-sm focus:ring-1 focus:ring-amber-500 outline-none resize-none"
          rows="2"
        />
        <Button
          onClick={handleAddPoint}
          className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>
    </div>
  );
};

export default ImportantConsiderationsSection;
