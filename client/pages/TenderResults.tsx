import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowLeft, Trophy, Medal, Award, Download, RefreshCw } from 'lucide-react';

interface TenderFinalScore {
  bidderName: string;
  technicalScore: number;
  financialScore: number;
  finalScore: number;
  rank: number;
}

interface TenderScore {
  id: string;
  tenderId: string;
  committeeMemberId: string;
  bidderName: string;
  scores: Record<number, number>;
  totalScore: number;
  submittedAt: string;
  status: string;
}

export default function TenderResults() {
  const { tenderId } = useParams<{ tenderId: string }>();
  const navigate = useNavigate();
  
  const [finalScores, setFinalScores] = useState<TenderFinalScore[]>([]);
  const [individualScores, setIndividualScores] = useState<TenderScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    if (!tenderId) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Fetch final aggregated scores
      const finalResponse = await fetch(`/api/tenders/${tenderId}/final-scores`);
      if (!finalResponse.ok) {
        throw new Error('Failed to fetch final scores');
      }
      const finalData = await finalResponse.json();
      setFinalScores(finalData);
      
      // Fetch individual committee member scores
      const scoresResponse = await fetch(`/api/tenders/${tenderId}/scores`);
      if (!scoresResponse.ok) {
        throw new Error('Failed to fetch individual scores');
      }
      const scoresData = await scoresResponse.json();
      setIndividualScores(scoresData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [tenderId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium">{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-50 border-yellow-200";
      case 2:
        return "bg-gray-50 border-gray-200";
      case 3:
        return "bg-amber-50 border-amber-200";
      default:
        return "";
    }
  };

  const handleExport = () => {
    // Simple CSV export
    const csvContent = [
      'Rank,Bidder Name,Technical Score,Financial Score,Final Score',
      ...finalScores.map(score => 
        `${score.rank},"${score.bidderName}",${score.technicalScore},${score.financialScore},${score.finalScore}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tender-${tenderId}-results.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tender results...</p>
          </div>
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
            <h1 className="text-3xl font-bold">Tender Results</h1>
            <p className="text-muted-foreground">Tender ID: {tenderId}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchResults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {finalScores.length > 0 && (
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Final Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="w-6 h-6 mr-2" />
            Final Evaluation Results
          </CardTitle>
          <CardDescription>
            Aggregated scores from all committee members with final rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {finalScores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No evaluation results available yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Results will appear once committee members submit their scores.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {finalScores.map((score) => (
                <div
                  key={score.bidderName}
                  className={`flex items-center justify-between p-4 border rounded-lg ${getRankColor(score.rank)}`}
                >
                  <div className="flex items-center space-x-4">
                    {getRankIcon(score.rank)}
                    <div>
                      <h3 className="font-semibold text-lg">{score.bidderName}</h3>
                      <div className="flex space-x-4 text-sm text-muted-foreground">
                        <span>Technical: {score.technicalScore.toFixed(1)}</span>
                        <span>Financial: {score.financialScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{score.finalScore.toFixed(1)}</div>
                    <Badge variant={score.rank === 1 ? "default" : "secondary"}>
                      Rank #{score.rank}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Results Table */}
      {finalScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Scoring Breakdown</CardTitle>
            <CardDescription>
              Complete scoring breakdown by evaluation criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Bidder Name</TableHead>
                  <TableHead className="text-right">Technical Score</TableHead>
                  <TableHead className="text-right">Financial Score</TableHead>
                  <TableHead className="text-right">Final Score</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {finalScores.map((score) => (
                  <TableRow key={score.bidderName}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getRankIcon(score.rank)}
                        <span className="font-medium">#{score.rank}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{score.bidderName}</TableCell>
                    <TableCell className="text-right">{score.technicalScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{score.financialScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">{score.finalScore.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={score.rank === 1 ? "default" : "secondary"}>
                        {score.rank === 1 ? "Winner" : "Evaluated"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Individual Scores */}
      {individualScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Committee Scores</CardTitle>
            <CardDescription>
              Raw scores submitted by each committee member ({individualScores.length} submissions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bidder Name</TableHead>
                  <TableHead>Committee Member</TableHead>
                  <TableHead className="text-right">Total Score</TableHead>
                  <TableHead className="text-right">Submitted</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {individualScores.map((score) => (
                  <TableRow key={score.id}>
                    <TableCell className="font-medium">{score.bidderName}</TableCell>
                    <TableCell>{score.committeeMemberId}</TableCell>
                    <TableCell className="text-right">{score.totalScore.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {new Date(score.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={score.status === 'submitted' ? "default" : "secondary"}>
                        {score.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={() => navigate(`/tender-scoring/${tenderId}`)}>
          Add More Scores
        </Button>
        <Button onClick={() => navigate('/admin-dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
