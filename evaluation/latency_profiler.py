# evaluation/latency_profiler.py
import time
import json

class LatencyProfiler:
    def __init__(self):
        self.logs = []

    def start_stage(self, stage_name):
        return time.perf_counter()

    def end_stage(self, stage_name, start_time):
        end_time = time.perf_counter()
        duration = end_time - start_time
        self.logs.append({
            "stage": stage_name,
            "duration": duration
        })
        return end_time

    def get_total_latency(self):
        total = sum(log['duration'] for log in self.logs)
        return {
            "total": total,
            "breakdown": self.logs,
            "status": "PASS" if total <= 1.8 else "FAIL"
        }

if __name__ == "__main__":
    # Mock profiling run
    lp = LatencyProfiler()
    s1 = lp.start_stage("capture")
    time.sleep(0.2)
    e1 = lp.end_stage("capture", s1)

    s2 = lp.start_stage("local_inf")
    time.sleep(0.4)
    e2 = lp.end_stage("local_inf", s2)

    s3 = lp.start_stage("network")
    time.sleep(0.3)
    e3 = lp.end_stage("network", s3)

    s4 = lp.start_stage("server_inf")
    time.sleep(0.6)
    e4 = lp.end_stage("server_inf", s4)

    s5 = lp.start_stage("dispatch")
    time.sleep(0.1)
    lp.end_stage("dispatch", s5)

    print(json.dumps(lp.get_total_latency(), indent=2))
