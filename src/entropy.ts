
export class Entropy {

    private process(str: string, evaluator: (key: string, value: number) => void): void {
        const h = Object.create(null);
        str.split('').forEach((c) => {
            h[c] && h[c]++ || (h[c] = 1);
        });
        for (let k in h) evaluator(k, h[k]);
    }

    public entropy(str: string): number {
        let sum = 0;
        let len = str.length;
        this.process(str, (k, f) => {
            let p = f / len;
            sum -= p * Math.log(p) / Math.log(2);
        });
        return sum;
    }

    public bits(str: string): number {
        return this.entropy(str) * str.length;
    }
}
