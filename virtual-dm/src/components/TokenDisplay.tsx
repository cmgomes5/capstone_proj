import { Token } from '../models/Token';

interface TokenDisplayProps {
  tokens: Token[];
  currentToken: Token | null;
  getTokenColor: (token: Token, index: number) => string;
}

/**
 * TokenDisplay Component
 * 
 * Displays combat tokens in two sections:
 * - Top half: Allied tokens (green background)
 * - Bottom half: Enemy tokens (gray background)
 * 
 * Each token shows name, initiative, and current/total HP
 * The currently selected token is highlighted with a yellow ring
 */
export default function TokenDisplay({ tokens, currentToken, getTokenColor }: TokenDisplayProps) {
  return (
    <div className="w-5/6 flex flex-col">
      {/* Top half - Allies */}
      <div className="flex-1 flex flex-wrap items-center justify-center bg-gray-200 p-4 gap-4 overflow-y-auto">
        {tokens
          .filter(token => token.ally)
          .map((token, index) => (
            <div key={`ally-${token.name}`} className="flex flex-col items-center">
              {/* Token name above the square */}
              <div className="text-sm font-medium text-gray-800 mb-1 text-center bg-white px-2 py-1 rounded shadow-sm">
                {token.name}
              </div>
              {/* Token square */}
              <div
                className={`w-28 h-28 ${getTokenColor(token, tokens.indexOf(token))} rounded flex items-center justify-center text-white font-bold shadow-md ${
                  currentToken && token.name === currentToken.name ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                <div className="text-2xl">{token.initiative}</div>
              </div>
              {/* HP bar below the square */}
              <div className="w-28 h-6 bg-gray-300 border border-black mt-1 relative overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${token.getHPPercentage()}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {token.currentHP}/{token.totalHP}
                </div>
              </div>
            </div>
          ))}
        {tokens.filter(token => token.ally).length === 0 && (
          <p className="text-gray-500 text-lg">No allies</p>
        )}
      </div>
      
      {/* Bottom half - Enemies */}
      <div className="flex-1 flex flex-wrap items-center justify-center bg-gray-300 p-4 gap-4 overflow-y-auto">
        {tokens
          .filter(token => !token.ally)
          .map((token, index) => (
            <div key={`enemy-${token.name}`} className="flex flex-col items-center">
              {/* Token name above the square */}
              <div className="text-sm font-medium text-gray-800 mb-1 text-center bg-white px-2 py-1 rounded shadow-sm">
                {token.name}
              </div>
              {/* Token square */}
              <div
                className={`w-28 h-28 ${getTokenColor(token, tokens.indexOf(token))} rounded flex items-center justify-center text-white font-bold shadow-md ${
                  currentToken && token.name === currentToken.name ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                <div className="text-2xl">{token.initiative}</div>
              </div>
              {/* HP bar below the square */}
              <div className="w-28 h-6 bg-gray-300 border border-black mt-1 relative overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${token.getHPPercentage()}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                  {token.currentHP}/{token.totalHP}
                </div>
              </div>
            </div>
          ))}
        {tokens.filter(token => !token.ally).length === 0 && (
          <p className="text-gray-500 text-lg">No enemies</p>
        )}
      </div>
    </div>
  );
}
