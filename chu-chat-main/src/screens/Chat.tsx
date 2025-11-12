import React, { useState, useRef, useEffect } from 'react';
import StatusBar from '../components/StatusBar';
import HeaderBar from '../components/HeaderBar';
import MessageBubble from '../components/MessageBubble';
import ChildHead from "../assets/img/child_head.png";
import VeteranHead from "../assets/img/veteran_head.png";
import Dict from "../assets/img/dict_icon.png";
import MessageIcon from "../assets/img/message_icon.png";
import { api } from '../utils/api';

interface ChatProps {
  selectedType: "beginner" | "veteran" ;
  onBack?: () => void;
  onViewDict?: () => void;
}

const Chat: React.FC<ChatProps> = ({ selectedType, onBack, onViewDict }) => {
  const profileImg = selectedType === "beginner" ? ChildHead : VeteranHead;
  const profileName = selectedType === "beginner" ? "입문자 키우Me" : "베테랑 키우Me"
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '매도에 대해 알고 싶어',
      isUser: true,
    },
    {
      id: 2,
      text: '매도란?\n매도란 보유하고 있는 주식이나 금융상품을\n시장에 내다 파는 행위를 의미합니다.\n매도를 통해 투자자는 보유 자산을 현금화하거나\n손실을 줄일 수 있습니다.\n키움증권의 영웅문 시스템을 통해 쉽게 매도 주문\n가능하며, 매도 시점과 가격에 따라 투자 수익이\n결정됩니다.\n매도는 투자에서 중요한 거래 행위 중 하나로,\n시장 상황과 투자 전략에 따라 적절한 시점에\n이루어져야 합니다.',
      isUser: false,
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [chatId, setChatId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 컴포넌트 마운트 시 서버 연결 확인
  useEffect(() => {
    api.health.check().then(() => {
      console.log('[Chat] 서버 연결 확인됨');
    }).catch((error) => {
      console.warn('[Chat] 서버 연결 실패:', error.message);
      console.warn('[Chat] 백엔드 서버가 http://127.0.0.1:8000 에서 실행 중인지 확인하세요.');
    });
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // 사용자 메시지 즉시 표시
    const userMsg = {
      id: messages.length + 1,
      text: userMessage,
      isUser: true,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // 백엔드로 메시지 전송
    const mentorCode = selectedType === "beginner" ? "rookie" : "veteran";
    api.messages.post({
      mentor_code: mentorCode,
      content: userMessage,
      chat_id: chatId,
    }).then((response) => {
      setChatId(response.chat_id);
      const assistantMsg = {
        id: messages.length + 2,
        text: response.assistant_message.content,
        isUser: false,
      };
      setMessages(prev => [...prev, assistantMsg]);
    }).catch((error) => {
      console.error('메시지 전송 실패:', error);
      let errorText = '죄송합니다. 응답을 받지 못했습니다.';
      
      if (error.code === 'ECONNABORTED') {
        errorText = '요청 시간이 초과되었습니다. 서버 상태를 확인해주세요.';
      } else if (error.request && !error.response) {
        errorText = '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요. (http://127.0.0.1:8000)';
      } else if (error.response) {
        errorText = `서버 오류: ${error.response.status} ${error.response.statusText}`;
      } else {
        errorText = `연결 실패: ${error.message || '알 수 없는 오류'}`;
      }
      
      const errorMsg = {
        id: messages.length + 2,
        text: errorText,
        isUser: false,
      };
      setMessages(prev => [...prev, errorMsg]);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '402px',
        height: '874px',
        backgroundColor: '#e9effe',
        overflow: 'hidden',
      }}
    >
      <StatusBar />
      <HeaderBar title="일취월Chat" onBack={onBack} />

      {/* 도감 확인 버튼 */}
      <button
        onClick={onViewDict}
        style={{
          position: 'absolute',
          left: '10px',
          top: '132px',
          width: '39px',
          height: '35px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <img 
          src={Dict}
          alt=""
          style = {{width:"20px", height:"20px"}}/>
        <p
          style={{
            fontFamily: 'Gabarito, Noto Sans KR',
            fontWeight: 'semibold',
            fontSize: '10px',
            color: '#a9a9a9',
          }}
        >
          도감
        </p>
      </button>

      {/* 메시지 영역 (스크롤 가능) */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '120px',
          width: '402px',
          height: '694px',
          overflowY: 'auto',
          padding: '20px',
          paddingTop:"100px",
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          scrollBehavior:"smooth"
        }}
      >
        {messages.map((message, idx) => (
          <div key={message.id}>
            {/*챗봇 프로필*/}
            {!message.isUser && (idx === 0 || messages[idx -1].isUser) && (
              <div
              style={{
                display:"flex",
                alignItems:"center",
                gap:"5px",
                marginBottom:"6px"
              }}>
                <img
                  src={profileImg}
                  alt=""
                  style={{width:"60px", height:"60px", objectFit:"cover"}}/>
                <span style={{
                  fontFamily: "Gabarito, Noto sans KR",
                  fontWeight:600,
                  fontSize:"13px",
                  color:"#000000"
                }}>
                  {profileName}
                </span>
              </div>
            )}
            {/*말풍선*/}
            <div style={{
              display: 'flex',
              justifyContent: message.isUser ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: '0px',
              marginLeft: message.isUser ? "0" : "-20px"
            }}
          >
              {!message.isUser && (
                <div
                  style={{width: '40px', flexShrink: 0,}}/>
              )}
              <MessageBubble
                message={message.text}
                isUser={message.isUser}
                style={{maxWidth: '280px',}}
              />
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '402px',
          height: '60px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '10px',
        }}
      >
        <div style={{
          flex:1,
          height:"40px",
          position:"relative",
          display:"flex",
          alignItems:"center",
          borderRadius:"30px",
          padding:"2px",
          background:"linear-gradient(90deg, #6F7BFF, #D6A2FF)"
        }}>
          <div style={{
            backgroundColor:"#ffffff",
            borderRadius:"30px",
            width:"100%",
            height:"100%",
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
            padding:"8px 10px 8px 18px"
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="키우Me에게 물어보세요"
              style={{
                flex: 1,
                fontFamily: 'ABeeZee, Noto Sans KR',
                fontSize: '14px',
                color: '#a9a9a9',
                outline: 'none',
                border:"none"
              }}
            />
            <button
              onClick={handleSend}
              style={{
                position:"absolute",
                right:"1px",
                width: '36px',
                height: '36px',
                background: "linear-gradient(135deg, #6F7BFF, #9BA5FF, #A4E2CE)",
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '20px',
              }}
            >
              <img 
                src={MessageIcon}
                alt=""
                style={{
                  width:"40px", 
                  height:"40px", 
                  objectFit:"contain", 
                  transform:"translate(4px, -3px)",
                  }}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

