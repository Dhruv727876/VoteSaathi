import { useState } from 'react';

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  reasoning?: string;
  groundingMetadata?: any;
}

export function useElectionChat(persona: string = 'default') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mapHistoryForGemini = (msgs: Message[]) => {
    return msgs.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = mapHistoryForGemini(messages);
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, persona, history }),
      });

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', text: '', reasoning: '' }]);
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantText = '';
        let assistantReasoning = '';
        
        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  const delta = data.choices[0]?.delta;
                  if (delta?.content) {
                    assistantText += delta.content;
                  }
                  if (delta?.reasoning_content) {
                    assistantReasoning += delta.reasoning_content;
                  }
                  
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = {
                      role: 'assistant',
                      text: assistantText,
                      reasoning: assistantReasoning
                    };
                    return newMsgs;
                  });
                } catch (e) {
                  // ignore JSON parse error
                }
              }
            }
          }
        }
      } else {
        const data = await response.json().catch(() => ({}));
        const errorMessage: Message = {
          role: 'assistant',
          text: `❌ Error: ${data?.error || 'Failed to get response'}. Please try again in a few seconds.`
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        text: "❌ Network error. Make sure the server is running."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const bustMyth = async (myth: string) => {
    if (!myth.trim()) return;

    const userMessage: Message = { role: 'user', text: myth };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = mapHistoryForGemini(messages);
      const response = await fetch('/api/mythbust/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: myth, persona, history }),
      });

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', text: '', reasoning: '' }]);
        
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantText = '';
        let assistantReasoning = '';
        
        if (reader) {
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
                try {
                  const data = JSON.parse(line.slice(6));
                  const delta = data.choices[0]?.delta;
                  if (delta?.content) {
                    assistantText += delta.content;
                  }
                  if (delta?.reasoning_content) {
                    assistantReasoning += delta.reasoning_content;
                  }
                  
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = {
                      role: 'assistant',
                      text: assistantText,
                      reasoning: assistantReasoning
                    };
                    return newMsgs;
                  });
                } catch (e) {
                  // ignore JSON parse error
                }
              }
            }
          }
        }
      } else {
        const data = await response.json().catch(() => ({}));
        const errorMessage: Message = {
          role: 'assistant',
          text: `❌ Error: ${data?.error || 'Failed to get response'}. Please try again in a few seconds.`
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error busting myth:', error);
      const errorMessage: Message = {
        role: 'assistant',
        text: "❌ Network error. Make sure the server is running."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, isLoading, sendMessage, bustMyth };
}
