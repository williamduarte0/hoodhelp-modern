import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagInput } from '@/components/ui/tag-input';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateService, useUpdateService, useService, type CreateServiceData } from '../hooks/useServices';
import toast from 'react-hot-toast';

export const CreateServicePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const previousRoute = location.state?.from || '/home';

  const [formData, setFormData] = useState<CreateServiceData>({
    title: '',
    description: '',
    category: [],
    budget: 0,
    isUrgent: false,
    tags: []
  });

  const { data: existingService } = useService(id || '');

  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();

  useEffect(() => {
    if (isEditing && existingService) {
      setFormData({
        title: existingService.title,
        description: existingService.description,
        category: Array.isArray(existingService.category) ? existingService.category : [existingService.category],
        budget: existingService.budget,
        isUrgent: existingService.isUrgent,
        tags: existingService.tags || []
      });
    }
  }, [isEditing, existingService]);

  const handleInputChange = (field: keyof CreateServiceData, value: any) => {
    setFormData((prev: CreateServiceData) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category.length || !formData.budget) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (isEditing) {
        await updateServiceMutation.mutateAsync({ id, data: formData });
        toast.success('Service updated successfully!');
      } else {
        await createServiceMutation.mutateAsync(formData);
        toast.success('Service created successfully!');
      }
        
      navigate(previousRoute);
    } catch (error) {
      toast.error(isEditing ? 'Failed to update service' : 'Failed to create service');
    }
  };

  const isLoading = createServiceMutation.isPending || updateServiceMutation.isPending;

  return (
    <Layout>
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(previousRoute)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Service" : "Post a Service"}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditing
            ? "Update your service details"
            : "Share what you need help with in your neighborhood"}
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Need help with garden maintenance"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe what you need help with..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <TagInput
                  label="Categories *"
                  placeholder="Add a category"
                  value={formData.category || []}
                  onChange={(categories) =>
                    handleInputChange("category", categories)
                  }
                  className="md:col-span-2"
                />
              </div>

              <div className="md:col-span-2">
                <TagInput
                  label="Tags"
                  placeholder="Add a tag"
                  value={formData.tags || []}
                  onChange={(tags) => handleInputChange("tags", tags)}
                />
              </div>

              <div>
                <Label htmlFor="budget">Budget (CAD) *</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) =>
                    handleInputChange("budget", parseFloat(e.target.value) || 0)
                  }
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="isUrgent"
                  type="checkbox"
                  checked={formData.isUrgent}
                  onChange={(e) =>
                    handleInputChange("isUrgent", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="isUrgent">Mark as urgent</Label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update Service"
                  : "Post Service"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(previousRoute)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default CreateServicePage;
