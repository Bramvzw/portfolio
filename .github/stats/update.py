#!/usr/bin/env python3
"""Collects the figures shown on the case study pages and writes them to assets/stats.json.

Run by .github/workflows/stats.yml once a day (and by hand). Every figure is measured from the
project itself, the same way the figures on the pages were first worked out:
  sooth  releases  published GitHub releases (no drafts)
         tests     `cargo test -- --list` on the latest release tag
         deps      entries under [dependencies] in Cargo.toml at that tag
         binary    size of the `sooth` binary in the aarch64-apple-darwin release archive (MB, 10^6)
  hub    versions  release tags vX.Y.Z of smart-home-hub, and the month of the first one
If one figure cannot be measured, its old value is kept, so the page never shows a gap.
"""
import io, json, os, re, subprocess, sys, tarfile, tempfile, urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'assets', 'stats.json')
TOKEN = os.environ.get('GITHUB_TOKEN', '')
MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus',
          'september', 'oktober', 'november', 'december']


def api(path):
    req = urllib.request.Request('https://api.github.com' + path, headers={
        'Accept': 'application/vnd.github+json', 'User-Agent': 'portfolio-stats',
        **({'Authorization': 'Bearer ' + TOKEN} if TOKEN else {})})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def download(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'portfolio-stats', 'Accept': 'application/octet-stream',
                                               **({'Authorization': 'Bearer ' + TOKEN} if TOKEN else {})})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def sooth(old):
    s = dict(old)
    rels = [r for r in api('/repos/Bramvzw/sooth/releases?per_page=100') if not r['draft']]
    if not rels:
        return s
    latest = max(rels, key=lambda r: r['published_at'])
    tag = latest['tag_name']
    s['version'] = tag.lstrip('v')
    s['minor'] = '.'.join(s['version'].split('.')[:2])
    s['releases'] = len(rels)
    try:
        asset = next(a for a in latest['assets'] if a['name'].endswith('aarch64-apple-darwin.tar.gz'))
        with tarfile.open(fileobj=io.BytesIO(download(asset['url']))) as t:
            m = next(m for m in t.getmembers() if m.isfile() and os.path.basename(m.name) == 'sooth')
            s['binary_mb'] = round(m.size / 1e6, 1)
    except Exception as e:
        print('binary size kept:', e, file=sys.stderr)
    with tempfile.TemporaryDirectory() as d:
        try:
            subprocess.run(['git', '-c', 'advice.detachedHead=false', 'clone', '-q', '--depth', '1', '--branch', tag,
                            'https://github.com/Bramvzw/sooth.git', d], check=True)
            cargo = open(os.path.join(d, 'Cargo.toml'), encoding='utf-8').read()
            sect = re.search(r'^\[dependencies\]\s*$(.*?)(?=^\[|\Z)', cargo, re.M | re.S)
            if sect:
                s['deps'] = len(re.findall(r'^[A-Za-z0-9_-]+\s*=', sect.group(1), re.M))
            out = subprocess.run(['cargo', 'test', '-q', '--', '--list'], cwd=d, check=True,
                                 capture_output=True, text=True).stdout
            n = sum(1 for line in out.splitlines() if line.endswith(': test'))
            if n:
                s['tests'] = n
        except Exception as e:
            print('tests/deps kept:', e, file=sys.stderr)
    return s


def hub(old):
    h = dict(old)
    tags = [t['name'] for t in api('/repos/Bramvzw/smart-home-hub/tags?per_page=100')
            if re.fullmatch(r'v\d+\.\d+\.\d+', t['name'])]
    if not tags:
        return h
    h['versions'] = len(tags)
    first = min(tags, key=lambda t: tuple(int(x) for x in t[1:].split('.')))
    sha = next(t['commit']['sha'] for t in api('/repos/Bramvzw/smart-home-hub/tags?per_page=100') if t['name'] == first)
    when = api('/repos/Bramvzw/smart-home-hub/commits/' + sha)['commit']['committer']['date']
    dt = datetime.fromisoformat(when.replace('Z', '+00:00'))
    h['since'] = '%s %d' % (MONTHS[dt.month - 1], dt.year)
    return h


def main():
    try:
        old = json.load(open(OUT, encoding='utf-8'))
    except Exception:
        old = {}
    new = {'sooth': sooth(old.get('sooth', {})), 'hub': hub(old.get('hub', {}))}
    if {k: old.get(k) for k in new} == new:
        print('no change')
        return
    new['updated'] = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(new, f, ensure_ascii=False, indent=2)
        f.write('\n')
    print(json.dumps(new, ensure_ascii=False))


if __name__ == '__main__':
    main()
