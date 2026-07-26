import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { codingAPI } from '../../api';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { Play, Send, ChevronDown, CheckCircle, XCircle, Clock, Cpu } from 'lucide-react';

const LANGS = [
  { id:'javascript', label:'JavaScript' },
  { id:'python',     label:'Python' },
  { id:'java',       label:'Java' },
  { id:'cpp',        label:'C++' },
  { id:'c',          label:'C' },
];

const STARTER = {
  javascript: '// Write your solution here\nfunction solution(input) {\n  \n}\n',
  python:     '# Write your solution here\ndef solution(input):\n    pass\n',
  java:       'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}\n',
  cpp:        '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n    // Your code here\n    return 0;\n}\n',
  c:          '#include <stdio.h>\nint main() {\n    // Your code here\n    return 0;\n}\n',
};

export default function CodingProblemPage() {
  const { slug } = useParams();
  const [lang, setLang] = useState('javascript');
  const [code, setCode] = useState(STARTER.javascript);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [customInput, setCustomInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: () => codingAPI.getBySlug(slug).then(r => r.data.data),
  });

  const handleLangChange = (l) => {
    setLang(l);
    setCode(data?.starterCode?.[l] || STARTER[l]);
  };

  const handleRun = async () => {
    setRunning(true); setResult(null);
    try {
      const { data: res } = await codingAPI.run({ code, language: lang, input: customInput, problemId: data?._id });
      setResult({ type: 'run', ...res.data });
    } catch { toast.error('Run failed'); }
    finally { setRunning(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true); setResult(null);
    try {
      const { data: res } = await codingAPI.submit({ code, language: lang, problemId: data?._id });
      setResult({ type: 'submit', ...res.data });
      if (res.data.status === 'accepted') toast.success('Accepted! 🎉');
      else toast.error(`${res.data.status.replace(/_/g,' ')}`);
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(false); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;

  const p = data;

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-80px)] -mx-4 lg:-mx-8 -mt-4 lg:-mt-8">
      {/* Left panel */}
      <div className="w-full lg:w-[45%] overflow-y-auto bg-white border-r border-gray-100">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
          {['description','hints','submissions'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-all ${activeTab===t?'border-primary text-primary':'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'description' && (
            <>
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="font-display text-xl font-black text-ink">{p?.title}</h1>
                <span className={`badge-${p?.difficulty} shrink-0`}>{p?.difficulty}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {p?.company?.map(c => (
                  <span key={c._id} className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{background:`${c.color}20`,color:c.color}}>{c.name}</span>
                ))}
                {p?.tags?.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">{t}</span>
                ))}
              </div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-6">
                <p>{p?.description}</p>
              </div>
              {p?.examples?.map((ex, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3 font-mono text-xs">
                  <div className="font-bold text-gray-500 mb-2">Example {i+1}</div>
                  <div><span className="text-gray-400">Input: </span>{ex.input}</div>
                  <div><span className="text-gray-400">Output: </span>{ex.output}</div>
                  {ex.explanation && <div className="mt-2 text-gray-500">{ex.explanation}</div>}
                </div>
              ))}
              {p?.constraints && (
                <div className="mt-4">
                  <div className="font-bold text-sm mb-2">Constraints</div>
                  <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs text-gray-600">{p.constraints}</div>
                </div>
              )}
            </>
          )}
          {activeTab === 'hints' && (
            <div className="space-y-3">
              {p?.hints?.length ? p.hints.map((h,i) => (
                <details key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                  <summary className="text-sm font-semibold text-yellow-700 cursor-pointer">Hint {i+1}</summary>
                  <p className="text-sm text-gray-600 mt-2">{h}</p>
                </details>
              )) : <p className="text-gray-400 text-sm">No hints for this problem.</p>}
            </div>
          )}
          {activeTab === 'submissions' && (
            <SubmissionsList problemSlug={slug} />
          )}
        </div>
      </div>

      {/* Right panel - Editor */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800">
          <select value={lang} onChange={e => handleLangChange(e.target.value)}
            className="bg-gray-800 text-gray-200 text-sm px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:border-primary">
            {LANGS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={handleRun} disabled={running}
              className="flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm px-4 py-1.5 rounded-lg transition-all font-medium">
              <Play size={14} /> {running ? 'Running…' : 'Run'}
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-600 text-white text-sm px-4 py-1.5 rounded-lg transition-all font-medium">
              <Send size={14} /> {submitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            language={lang}
            value={code}
            onChange={v => setCode(v || '')}
            theme="vs-dark"
            options={{ fontSize:14, minimap:{enabled:false}, scrollBeyondLastLine:false, tabSize:2, wordWrap:'on' }}
          />
        </div>

        {/* Result panel */}
        {result && (
          <div className="bg-gray-900 border-t border-gray-800 p-4 max-h-52 overflow-y-auto">
            {result.type === 'run' ? (
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Output</div>
                <pre className="font-mono text-sm text-gray-200 whitespace-pre-wrap">{result.stdout || result.stderr || result.compile_output || 'No output'}</pre>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {result.time && <span><Clock size={11} className="inline mr-1"/>{result.time}s</span>}
                  {result.memory && <span><Cpu size={11} className="inline mr-1"/>{result.memory}KB</span>}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {result.status === 'accepted'
                    ? <CheckCircle size={18} className="text-green-400"/>
                    : <XCircle size={18} className="text-red-400"/>}
                  <span className={`font-bold text-sm ${result.status==='accepted'?'text-green-400':'text-red-400'}`}>
                    {result.status?.replace(/_/g,' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{result.testsPassed}/{result.testsTotal} tests passed</span>
                </div>
                {result.error && <pre className="font-mono text-xs text-red-300">{result.error}</pre>}
              </div>
            )}
          </div>
        )}

        {/* Custom input */}
        <div className="bg-gray-900 border-t border-gray-800 p-3">
          <details>
            <summary className="text-xs text-gray-400 cursor-pointer font-medium flex items-center gap-1">Custom Input <ChevronDown size={12}/></summary>
            <textarea value={customInput} onChange={e=>setCustomInput(e.target.value)} rows={3}
              className="w-full mt-2 bg-gray-800 text-gray-200 text-xs font-mono p-2 rounded-lg border border-gray-700 focus:outline-none resize-none"
              placeholder="Enter custom input…" />
          </details>
        </div>
      </div>
    </div>
  );
}

function SubmissionsList({ problemSlug }) {
  const { data } = useQuery({
    queryKey: ['submissions', problemSlug],
    queryFn: () => codingAPI.getSubmissions(problemSlug).then(r => r.data.data),
  });
  if (!data?.length) return <p className="text-gray-400 text-sm">No submissions yet.</p>;
  return (
    <div className="space-y-2">
      {data.map(s => (
        <div key={s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
          <span className={`font-bold ${s.status==='accepted'?'text-green-600':'text-red-500'}`}>{s.status?.replace(/_/g,' ').toUpperCase()}</span>
          <span className="text-gray-400 text-xs">{s.language} · {new Date(s.createdAt).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}
