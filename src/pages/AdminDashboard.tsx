import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, LogOut, Trash2, Search, RefreshCw, 
  Trophy, Calendar, AlertTriangle, CheckCircle,
  ChevronLeft, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useAdminLeaderboard, LeaderboardEntry, DailyChallengeEntry } from '@/hooks/useAdminLeaderboard';
import { useToast } from '@/hooks/use-toast';
import { containsProfanity } from '@/utils/profanityFilter';

type TabType = 'leaderboard' | 'daily';

export default function AdminDashboard() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    fetchAllLeaderboardEntries,
    fetchAllDailyChallengeEntries,
    deleteLeaderboardEntry,
    deleteDailyChallengeEntry,
    searchEntries,
    isLoading,
    error,
  } = useAdminLeaderboard();

  const [activeTab, setActiveTab] = useState<TabType>('leaderboard');
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [dailyEntries, setDailyEntries] = useState<DailyChallengeEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const PAGE_SIZE = 20;

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  // Fetch data
  useEffect(() => {
    if (!isAdmin) return;
    loadData();
  }, [isAdmin, activeTab, currentPage]);

  const loadData = async () => {
    setSearchTerm('');
    if (activeTab === 'leaderboard') {
      const result = await fetchAllLeaderboardEntries(PAGE_SIZE, currentPage * PAGE_SIZE);
      setLeaderboardEntries(result.data);
      setTotalCount(result.count);
    } else {
      const result = await fetchAllDailyChallengeEntries(PAGE_SIZE, currentPage * PAGE_SIZE);
      setDailyEntries(result.data);
      setTotalCount(result.count);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadData();
      return;
    }

    const table = activeTab === 'leaderboard' ? 'leaderboard' : 'daily_challenge_scores';
    const results = await searchEntries(table, searchTerm);
    
    if (activeTab === 'leaderboard') {
      setLeaderboardEntries(results as LeaderboardEntry[]);
    } else {
      setDailyEntries(results as DailyChallengeEntry[]);
    }
    setTotalCount(results.length);
  };

  const handleDelete = async (id: string) => {
    const success = activeTab === 'leaderboard'
      ? await deleteLeaderboardEntry(id)
      : await deleteDailyChallengeEntry(id);

    if (success) {
      toast({
        title: 'Entry deleted',
        description: 'The entry has been removed from the leaderboard.',
      });
      loadData();
    } else {
      toast({
        title: 'Delete failed',
        description: error || 'Could not delete the entry. Make sure you have admin permissions.',
        variant: 'destructive',
      });
    }
    setDeleteConfirmId(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-bg to-game-grid-darker flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const entries = activeTab === 'leaderboard' ? leaderboardEntries : dailyEntries;

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg to-game-grid-darker p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-game-text-muted hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-game-accent" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-game-text-muted text-sm">{user?.email}</p>
              </div>
            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="border-game-grid-border text-game-text-muted hover:text-white hover:bg-game-grid-dark"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => { setActiveTab('leaderboard'); setCurrentPage(0); }}
            className={`${
              activeTab === 'leaderboard'
                ? 'bg-game-accent text-white'
                : 'bg-game-grid-dark text-game-text-muted hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Global Leaderboard
          </Button>
          <Button
            onClick={() => { setActiveTab('daily'); setCurrentPage(0); }}
            className={`${
              activeTab === 'daily'
                ? 'bg-game-accent text-white'
                : 'bg-game-grid-dark text-game-text-muted hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Daily Challenges
          </Button>
        </div>

        {/* Search & Refresh */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-game-text-muted" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by player name..."
              className="pl-10 bg-game-grid-darker/50 border-game-grid-border text-white placeholder:text-game-text-muted/50"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="bg-game-grid-dark text-white hover:bg-game-grid-border"
          >
            Search
          </Button>
          <Button
            onClick={loadData}
            variant="outline"
            className="border-game-grid-border text-game-text-muted hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Stats */}
        <div className="bg-game-grid-dark/50 rounded-lg p-4 mb-6 border border-game-grid-border">
          <p className="text-game-text-muted text-sm">
            Showing {entries.length} of {totalCount} entries
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {/* Table */}
        <div className="bg-gradient-to-b from-game-grid-dark to-game-grid-darker rounded-xl border border-game-grid-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-game-grid-border">
                  <th className="text-left p-4 text-game-text-muted font-medium">Player Name</th>
                  <th className="text-left p-4 text-game-text-muted font-medium">Score</th>
                  {activeTab === 'daily' && (
                    <th className="text-left p-4 text-game-text-muted font-medium">Date</th>
                  )}
                  <th className="text-left p-4 text-game-text-muted font-medium">Created</th>
                  <th className="text-left p-4 text-game-text-muted font-medium">Status</th>
                  <th className="text-right p-4 text-game-text-muted font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {entries.map((entry) => {
                    const hasProfanity = containsProfanity(entry.player_name);
                    const isDaily = 'challenge_date' in entry;
                    
                    return (
                      <motion.tr
                        key={entry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`border-b border-game-grid-border/50 ${
                          hasProfanity ? 'bg-red-500/10' : ''
                        }`}
                      >
                        <td className="p-4 text-white font-medium">
                          {entry.player_name}
                        </td>
                        <td className="p-4 text-game-accent font-bold">
                          {entry.score.toLocaleString()}
                        </td>
                        {isDaily && (
                          <td className="p-4 text-game-text-muted">
                            {(entry as DailyChallengeEntry).challenge_date}
                          </td>
                        )}
                        <td className="p-4 text-game-text-muted text-sm">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {hasProfanity ? (
                            <span className="flex items-center gap-1 text-red-400 text-sm">
                              <AlertTriangle className="w-4 h-4" />
                              Flagged
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-green-400 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Clean
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {deleteConfirmId === entry.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-game-text-muted text-sm">Delete?</span>
                              <Button
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                              >
                                Yes
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirmId(null)}
                                className="border-game-grid-border text-game-text-muted"
                              >
                                No
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteConfirmId(entry.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {entries.length === 0 && (
            <div className="p-8 text-center text-game-text-muted">
              No entries found
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              variant="outline"
              className="border-game-grid-border text-game-text-muted"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-game-text-muted">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
              variant="outline"
              className="border-game-grid-border text-game-text-muted"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
