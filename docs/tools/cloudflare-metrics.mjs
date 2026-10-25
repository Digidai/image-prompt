// Local, read-only operations helper. Reuses Wrangler's existing session;
// never prints a credential or copies it into a browser/build environment.
import fs from 'node:fs/promises';
import path from 'node:path';
import {cloudflareToken} from '../../scripts/cloudflare-auth.mjs';

const dateFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}),localDay=dateFormat.format(new Date());
const until=new Date(localDay+'T00:00:00+08:00'),since=new Date(until.getTime()-86400000),at=new Date().toISOString();
const token=cloudflareToken();
const query=`{viewer{accounts(filter:{accountTag:"48d9ccaf5ee7914c803b5d0656462848"}){workersInvocationsAdaptive(limit:1,filter:{scriptName:"image-prompt",datetime_geq:"${since.toISOString()}",datetime_lt:"${until.toISOString()}"}){sum{requests errors}} rumPageloadEventsAdaptiveGroups(limit:10,filter:{datetime_geq:"${since.toISOString()}",datetime_lt:"${until.toISOString()}",requestHost:"prompt.genedai.me"}){count sum{visits}}}}}`;
const response=await fetch('https://api.cloudflare.com/client/v4/graphql',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({query}),signal:AbortSignal.timeout(20000)});
if(!response.ok)throw Error('Analytics API HTTP '+response.status);
const result=await response.json(),account=result.data?.viewer?.accounts?.[0],worker=account?.workersInvocationsAdaptive?.[0]?.sum,rum=account?.rumPageloadEventsAdaptiveGroups;
const report={at,window:{since:since.toISOString(),until:until.toISOString(),timezone:'Asia/Shanghai',description:'Previous complete Beijing calendar day'},workerName:'image-prompt',rumHostname:'prompt.genedai.me',workerInvocations:worker||null,rum:rum?.length?{state:'recorded_beacons',groups:rum}:{state:rum?'no_recorded_beacons':'unknown',visits:null,pageLoads:null},errors:result.errors||[],limitations:['Worker requests include bots, probes, APIs, assets and alternate hosts. They are not PV, UV or organic visitors.','Empty RUM data does not establish zero visitors.','Bing/Google actual indexation and search performance require separate provider evidence.']};
const output=`output/metrics/cloudflare-${dateFormat.format(since)}-${at.replaceAll(':','-')}.json`;
await fs.mkdir(path.dirname(output),{recursive:true});await fs.writeFile(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({output,...report}));if(report.errors.length)process.exitCode=1;
