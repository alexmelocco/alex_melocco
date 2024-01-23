import time

# Testing a terminal progress bar

# use this style when you implement the gradient descent algo later on

def update_progress(iteration, total):
    progress = iteration / total
    bar_length = 30
    block = int(round(bar_length * progress))
    progress_text = f"{iteration}/{total}"
    bar = "[" + "=" * block + " " * (bar_length - block) + "]"
    status = f"{progress * 100:.2f}%"
    full_line = f"\r{progress_text} {bar} {status}"
    print(full_line, end="", flush=True)

# Example usage
total_iterations = 30

for i in range(1, total_iterations + 1):
    update_progress(i, total_iterations)
    time.sleep(0.1)  # Simulate some work being done

print("\nDone!")