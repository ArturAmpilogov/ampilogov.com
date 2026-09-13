"""Idempotent source backlinks and explicit reviewed proposals for the Anfilogov search."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'data/genealogy'
def read(p):return json.loads(p.read_text())
def save(p,d):
 text=json.dumps(d,ensure_ascii=False,indent=2)+'\n'
 if read(p)!=d:p.write_text(text)
people={read(p)['personId']:(p,read(p)) for p in (BASE/'people').glob('*.json')}
sources={read(p)['sourceId']:(p,read(p)) for p in (BASE/'sources').rglob('*.json') if 'sourceId' in read(p)}
batches=[read(p) for p in (BASE/'searches').glob('yandex-archive-anfilogov-2026-09-13-batch*.json')]
ids=set()
for b in batches:
 for r in b.get('results',b.get('items',b.get('cards',[]))):
  ids.update(r.get('sourceIds',[]));ids.update([r['sourceId']] if r.get('sourceId') else [])
for sid in ids:
 if sid not in sources:raise ValueError(sid)
 d=sources[sid][1]
 for m in d.get('mentions',[]):
  pid=m.get('personId')
  if pid not in people:continue
  p,v=people[pid];v.setdefault('sourceIds',[])
  if sid not in v['sourceIds']:v['sourceIds'].append(sid)
for b in batches:
 for key in ['proposedBacklinks','backlinkProposals','personBacklinkProposals']:
  for q in b.get(key,[]):
   pid=q.get('personId')
   if pid not in people:continue
   p,d=people[pid];sid=q.get('sourceId')
   if sid and sid not in d.setdefault('sourceIds',[]):d['sourceIds'].append(sid)
   note=q.get('proposedNote') or q.get('basis')
   # Action-specific corrections below replace stale facts instead of appending instructions.
   if note and not q.get('action') and note not in d.setdefault('notes',[]):d['notes'].append(note)
   if q.get('childIds'):
    children=d.setdefault('children',[])
    if isinstance(children,list):
     for cid in q['childIds']:
      if cid not in children:children.append(cid)
for p,d in people.values():save(p,d)
print(f'Integrated reviewed backlinks from {len(ids)} sources and {len(batches)} batches')
