# evaluation/resource_monitor.py
import psutil
import time
import json

def monitor_resources(duration_sec=60, interval=1):
    """
    Monitors CPU and RAM usage of the browser process.
    """
    print(f"Monitoring resources for {duration_sec}s...")
    stats = []

    # Find Chrome/Firefox processes
    browser_processes = []
    for proc in psutil.process_iter(['name']):
        if 'chrome' in proc.info['name'].lower() or 'firefox' in proc.info['name'].lower():
            browser_processes.append(proc)

    start_time = time.time()
    while time.time() - start_time < duration_sec:
        cpu_sum = 0
        ram_sum = 0
        for proc in browser_processes:
            try:
                cpu_sum += proc.cpu_percent(interval=None)
                ram_sum += proc.memory_info().rss / (1024 * 1024) # MB
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue

        stats.append({
            "timestamp": time.time() - start_time,
            "cpu_percent": cpu_sum,
            "ram_mb": ram_sum
        })
        time.sleep(interval)

    avg_cpu = sum(s['cpu_percent'] for s in stats) / len(stats)
    peak_ram = max(s['ram_mb'] for s in stats)

    return {
        "avg_cpu": avg_cpu,
        "peak_ram": peak_ram,
        "status": "PASS" if avg_cpu <= 25 and peak_ram <= 600 else "FAIL"
    }

if __name__ == "__main__":
    result = monitor_resources()
    print(json.dumps(result, indent=2))
