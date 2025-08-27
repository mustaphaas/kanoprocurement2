import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Send, Calculator, Trophy, FileText } from 'lucide-react';

interface EvaluationCriteria {
  id: number;
  name: string;
  maxScore: number;
  weight?: number;
  type?: 'technical' | 'financial';
}

interface EvaluationTemplate {
  id: string;
  name: string;
  description?: string;
  criteria: EvaluationCriteria[];
}

interface TenderAssignment {
  id: string;
  tenderId: string;
  evaluationTemplateId: string;
  committeeMemberId: string;
  status: string;
  evaluationStart: string;
  evaluationEnd: string;
}

interface TenderScore {
  tenderId: string;
  committeeMemberId: string;
  bidderName: string;
  scores: Record<number, number>;
}

export default function TenderScoring() {
  const { tenderId } = useParams<{ tenderId: string }>();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState<TenderAssignment | null>(null);
  const [template, setTemplate] = useState<EvaluationTemplate | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [bidderName, setBidderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  
  const currentUserId = 'user123'; // In production, get from auth context

  useEffect(() => {
    const fetchData = async () => {
      if (!tenderId) return;
      
      try {
        setLoading(true);
        
        // Fetch tender assignment
        const assignmentResponse = await fetch(`/api/tenders/${tenderId}/assignment`);
        if (!assignmentResponse.ok) {
          throw new Error('Failed to fetch tender assignment');
        }
        const assignmentData = await assignmentResponse.json();
        setAssignment(assignmentData);
        
        // Fetch evaluation template
        const templateResponse = await fetch(`/api/evaluation-templates/${assignmentData.evaluationTemplateId}`);
        if (!templateResponse.ok) {
          throw new Error('Failed to fetch evaluation template');
        }
        const templateData = await templateResponse.json();
        setTemplate(templateData);
        
        // Initialize scores object
        const initialScores: Record<number, number> = {};
        templateData.criteria.forEach((criterion: EvaluationCriteria) => {
          initialScores[criterion.id] = 0;
        });
        setScores(initialScores);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenderId]);

  const handleScoreChange = (criteriaId: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const maxScore = template?.criteria.find(c => c.id === criteriaId)?.maxScore || 0;
    
    if (numValue > maxScore) {
      setError(`Score cannot exceed maximum of ${maxScore}`);
      return;
    }
    
    setError('');
    setScores(prev => ({
      ...prev,
      [criteriaId]: numValue
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(scores).reduce((total, score) => total + score, 0);
  };

  const calculateMaxTotalScore = () => {
    return template?.criteria.reduce((total, criterion) => total + criterion.maxScore, 0) || 0;
  };

  const handleSubmit = async () => {
    if (!bidderName.trim()) {
      setError('Please enter the bidder name');
      return;
    }

    if (!template || !tenderId) {
      setError('Missing tender or template information');
      return;
    }

    // Validate all scores are entered
    const hasAllScores = template.criteria.every(criterion => scores[criterion.id] > 0);
    if (!hasAllScores) {
      setError('Please enter scores for all criteria');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const scoreData: TenderScore = {
        tenderId,
        committeeMemberId: currentUserId,
        bidderName: bidderName.trim(),
        scores
      };

      const response = await fetch('/api/tender-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit scores');
      }

      setSuccess('Scores submitted successfully!');
      
      // Reset form
      setBidderName('');
      const initialScores: Record<number, number> = {};
      template.criteria.forEach((criterion: EvaluationCriteria) => {
        initialScores[criterion.id] = 0;
      });
      setScores(initialScores);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit scores');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewResults = () => {
    navigate(`/tender-results/${tenderId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tender scoring...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment || !template) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tender Not Found</h1>
          <p className="text-muted-foreground mb-4">The requested tender could not be found or you don't have access to score it.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Tender Scoring</h1>
            <p className="text-muted-foreground">Tender ID: {tenderId}</p>
          </div>
        </div>
        <Button onClick={handleViewResults} variant="outline">
          <Trophy className="w-4 h-4 mr-2" />
          View Results
        </Button>
      </div>

      <Tabs defaultValue="scoring" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scoring" className="flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Scoring
          </TabsTrigger>
          <TabsTrigger value="template" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Template Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-6">
          {/* Template Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {template.name}
                <Badge variant="secondary">{template.type || 'QCBS'}</Badge>
              </CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
          </Card>

          {/* Scoring Form */}
          <Card>
            <CardHeader>
              <CardTitle>Score Evaluation</CardTitle>
              <CardDescription>
                Enter scores for each evaluation criterion. Maximum total score: {calculateMaxTotalScore()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bidder Name */}
              <div className="space-y-2">
                <Label htmlFor="bidderName">Bidder Name *</Label>
                <Input
                  id="bidderName"
                  value={bidderName}
                  onChange={(e) => setBidderName(e.target.value)}
                  placeholder="Enter bidder/company name"
                  required
                />
              </div>

              {/* Scoring Criteria */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Evaluation Criteria</h3>
                {template.criteria.map((criterion) => (
                  <div key={criterion.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor={`score-${criterion.id}`} className="font-medium">
                          {criterion.name}
                        </Label>
                        <Badge variant={criterion.type === 'financial' ? 'default' : 'secondary'}>
                          {criterion.type === 'financial' ? 'Financial' : 'Technical'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Maximum Score: {criterion.maxScore}
                        {criterion.weight && ` | Weight: ${(criterion.weight * 100).toFixed(0)}%`}
                      </p>
                    </div>
                    <div className="w-24">
                      <Input
                        id={`score-${criterion.id}`}
                        type="number"
                        min="0"
                        max={criterion.maxScore}
                        step="0.1"
                        value={scores[criterion.id] || ''}
                        onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Score */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <span className="font-semibold">Total Score:</span>
                <span className="text-2xl font-bold">
                  {calculateTotalScore().toFixed(1)} / {calculateMaxTotalScore()}
                </span>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex space-x-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !bidderName.trim()}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Scores
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Template Details</CardTitle>
              <CardDescription>
                Complete scoring criteria and weightings for this tender evaluation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Template Name:</span> {template.name}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {template.type || 'QCBS'}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Description:</span> {template.description}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Scoring Criteria:</h4>
                  {template.criteria.map((criterion) => (
                    <div key={criterion.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium">{criterion.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({criterion.type === 'financial' ? 'Financial' : 'Technical'})
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{criterion.maxScore} points</div>
                        {criterion.weight && (
                          <div className="text-sm text-muted-foreground">
                            {(criterion.weight * 100).toFixed(0)}% weight
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
