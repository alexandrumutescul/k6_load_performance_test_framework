import http from 'k6/http';
import { check, sleep } from "k6";
import { Counter, Rate } from "k6/metrics";

let ErrorCount = new Counter("errors");
let ErrorRate = new Rate("error_rate");

export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 100,
      stages: [
        { target: 200, duration: '30s' },
        { target: 0, duration: '30s' },
      ],
    }
  },
  thresholds: {
    errors: ["rate<10"]
  }
};

export default function() {
    const status = Math.random() < 0.9 ? "200" : "500";
    let res = http.get(`https://test.k6.io/contacts.php`);
    let success = check(res, {
        "status is 200": r => r.status === 200
    });
    if (!success) {
        ErrorCount.add(1);
        ErrorRate.add(true);
    } else {
       ErrorRate.add(false);
    }
  
    sleep(0.5);
}