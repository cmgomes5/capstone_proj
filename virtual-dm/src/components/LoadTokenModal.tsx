import { useState, useEffect } from 'react';
import { Token } from '../models/Token';
import { loadAllTokens, TokenData } from '../services/tokenService';


interface LoadTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadToken: (token: Token) => void;
}

/**
 * LoadTokenModal Component
 * 
 * Allows users to load premade tokens from JSON files.
 * Users can browse different categories and select tokens to add.
 */
export default function LoadTokenModal({ isOpen, onClose, onLoadToken }: LoadTokenModalProps) {
  const [selectedTab, setSelectedTab] = useState<'default' | 'custom'>('default');
  const [defaultTokens, setDefaultTokens] = useState<TokenData[]>([]);
  const [customTokens, setCustomTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<{ clickhouse: boolean; files: boolean }>({ clickhouse: false, files: false });

  const tabs = [
    { id: 'default' as const, name: 'Default', tokens: defaultTokens },
    { id: 'custom' as const, name: 'Custom', tokens: customTokens }
  ];

  // Load tokens when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTokensFromAllSources();
    }
  }, [isOpen]);


  const loadTokensFromAllSources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadAllTokens();
      
      setDefaultTokens(result.tokens.default);
      setCustomTokens(result.tokens.custom);
      setSources(result.sources);
      
      const totalTokens = result.tokens.default.length + result.tokens.custom.length;
      
      if (totalTokens === 0) {
        setError('No tokens found from any source');
      } else if (result.error) {
        // Show warning about ClickHouse but don't treat as error since we have file tokens
        console.warn('ClickHouse warning:', result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tokens');
      setDefaultTokens([]);
      setCustomTokens([]);
      setSources({ clickhouse: false, files: false });
    } finally {
      setLoading(false);
    }
  };

  const validateImageUrl = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
      
      // Set a timeout to avoid hanging on slow/unresponsive URLs
      setTimeout(() => resolve(false), 5000); // 5 second timeout
    });
  };

  const handleTokenSelect = async (tokenData: TokenData) => {
    // Create a new Token instance with a random initiative (1-20)
    const initiative = Math.floor(Math.random() * 20) + 1;
    
    let validImageUrl: string | undefined = tokenData.imageUrl;
    
    // Validate image URL if provided
    if (tokenData.imageUrl) {
      const isImageValid = await validateImageUrl(tokenData.imageUrl);
      if (!isImageValid) {
        console.warn(`Image failed to load for ${tokenData.name}: ${tokenData.imageUrl}`);
        validImageUrl = undefined; // Treat as no image
      }
    }
    
    const token = new Token(
      tokenData.name,
      tokenData.totalHP,
      initiative,
      tokenData.ally,
      tokenData.totalHP, // Start with full HP
      validImageUrl
    );
    
    onLoadToken(token);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw] max-h-[80vh] mx-4 shadow-xl flex flex-col pointer-events-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Load Existing Token</h2>
            {!loading && (sources.clickhouse || sources.files) && (
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-gray-500">Sources:</span>
                {sources.files && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    Files ✓
                  </span>
                )}
                {sources.clickhouse && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    ClickHouse ✓
                  </span>
                )}
                {!sources.clickhouse && sources.files && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                    ClickHouse ⚠
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>


        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {tab.name} ({tab.tokens.length})
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading tokens...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">{error}</div>
            </div>
          )}

          {!loading && !error && (() => {
            const currentTokens = selectedTab === 'default' ? defaultTokens : customTokens;
            
            if (currentTokens.length === 0) {
              return (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">
                    No tokens found in {selectedTab} directory
                  </div>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTokens.map((token: TokenData, index: number) => (
                  <div
                    key={index}
                    onClick={() => handleTokenSelect(token)}
                    className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Token Image or Placeholder */}
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                        {token.imageUrl ? (
                          <img
                            src={token.imageUrl}
                            alt={token.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-gray-500 text-xs">No Image</span>
                        )}
                      </div>
                      
                      {/* Token Info */}
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{token.name}</div>
                        <div className="text-sm text-gray-600">
                          HP: {token.totalHP} • {token.ally ? 'Ally' : 'Enemy'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
