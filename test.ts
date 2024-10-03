import { defaultIfEmpty, forkJoin, map, mergeMap, Observable, of } from "rxjs";
import { catchError } from "./node_modules/rxjs/dist/types/index";

interface MediaItem {
    name: string;
}

interface MediaDirectory extends MediaItem {
    files: MediaItem[];
    subfolders$: Observable<MediaDirectory>[];
}

function f(name: string) {
    return { name };
}

const testCase: MediaDirectory = {
    name: "1",
    files: [f("a"), f("b")],
    subfolders$: [
        of({
            name: "2",
            files: [f("c"), f("d")],
            subfolders$: [
                of({
                    name: "3",
                    files: [f("e"), f("f")],
                    subfolders$: [],
                })
            ]
        }),
        of({
            name: "3",
            files: [f("g"), f("h")],
            subfolders$: [
                of({
                    name: "4",
                    files: [f("i"), f("j")],
                    subfolders$: []
                })
            ],
        })
    ]
}

function filesRecursive(mediaDirectory: MediaDirectory): Observable<MediaItem[]> {
    
    const directories = mediaDirectory.subfolders$.map(x => x.pipe(mergeMap(filesRecursive), catchError(() => of([]))))

    return forkJoin(directories).pipe(
        defaultIfEmpty([]),
        map(items => [...(mediaDirectory.files || []), ...((items || []).flat())])
    )
}

filesRecursive(testCase).subscribe(console.log)