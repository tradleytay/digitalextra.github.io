import sys
import os
import re
from html.parser import HTMLParser
import json

VOID_ELEMENTS = set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])

class TagStackParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.mismatches = []
        self.positions = []

    def handle_starttag(self, tag, attrs):
        # treat void elements as not pushed
        if tag.lower() in VOID_ELEMENTS:
            return
        # some tags may be self-closed in the source, but HTMLParser does not tell; we'll push anyway
        self.stack.append((tag, self.getpos()))

    def handle_endtag(self, tag):
        if not self.stack:
            self.mismatches.append({'type':'unexpected_end', 'tag':tag, 'pos':self.getpos()})
            return
        # pop until matching tag found
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i][0] == tag:
                # pop all after i
                for _ in range(len(self.stack)-i):
                    popped = self.stack.pop()
                return
        # no matching start
        self.mismatches.append({'type':'no_matching_start', 'tag':tag, 'pos':self.getpos()})


def analyze_file(path):
    res = {'file': path, 'duplicate_ids': [], 'id_counts': {}, 'unclosed_stack': [], 'mismatches': []}
    try:
        with open(path, 'r', encoding='utf-8') as f:
            text = f.read()
    except Exception as e:
        res['error'] = str(e)
        return res
    # duplicate ids
    ids = re.findall(r'id\s*=\s*["\']([^"\']+)["\']', text)
    counts = {}
    for i,v in enumerate(ids):
        counts[v] = counts.get(v,0)+1
    res['id_counts'] = counts
    res['duplicate_ids'] = [k for k,c in counts.items() if c>1]

    # parse tags
    parser = TagStackParser()
    try:
        parser.feed(text)
        parser.close()
    except Exception as e:
        res['parse_error'] = str(e)

    # remaining stack are unclosed tags
    res['unclosed_stack'] = [{'tag':t, 'pos':pos} for (t,pos) in parser.stack]
    res['mismatches'] = parser.mismatches
    return res


def main():
    root = os.path.dirname(os.path.abspath(__file__))
    # assume html files are in root parent (workspace) — search recursively up one level
    base = os.path.abspath(os.path.join(root, '..'))
    results = []
    for dirpath, dirs, files in os.walk(base):
        for fn in files:
            if fn.lower().endswith('.html'):
                path = os.path.join(dirpath, fn)
                results.append(analyze_file(path))
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    main()
