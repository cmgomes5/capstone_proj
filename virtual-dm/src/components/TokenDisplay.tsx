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
      <div className="flex-1 flex flex-wrap items-center justify-center bg-gray-200 p-4 gap-3 overflow-y-auto">
        {tokens
          .filter(token => token.ally)
          .map((token, index) => (
            <div
              key={`ally-${token.name}`}
              className={`w-28 h-28 ${getTokenColor(token, tokens.indexOf(token))} rounded flex flex-col items-center justify-center text-white font-bold shadow-md ${
                currentToken && token.name === currentToken.name ? 'ring-4 ring-yellow-400' : ''
              }`}
            >
              <div className="text-sm">{token.name}</div>
              <div className="text-lg">{token.initiative}</div>
              <div className="text-sm">{token.currentHP}/{token.totalHP}</div>
            </div>
          ))}
        {tokens.filter(token => token.ally).length === 0 && (
          <p className="text-gray-500 text-lg">No allies</p>
        )}
      </div>
      
      {/* Bottom half - Enemies */}
      <div className="flex-1 flex flex-wrap items-center justify-center bg-gray-300 p-4 gap-3 overflow-y-auto">
        {tokens
          .filter(token => !token.ally)
          .map((token, index) => (
            <div
              key={`enemy-${token.name}`}
              className={`w-28 h-28 ${getTokenColor(token, tokens.indexOf(token))} rounded flex flex-col items-center justify-center text-white font-bold shadow-md ${
                currentToken && token.name === currentToken.name ? 'ring-4 ring-yellow-400' : ''
              }`}
            >
              <div className="text-sm">{token.name}</div>
              <div className="text-lg">{token.initiative}</div>
              <div className="text-sm">{token.currentHP}/{token.totalHP}</div>
            </div>
          ))}
        {tokens.filter(token => !token.ally).length === 0 && (
          <p className="text-gray-500 text-lg">No enemies</p>
        )}
      </div>
    </div>
  );
}
