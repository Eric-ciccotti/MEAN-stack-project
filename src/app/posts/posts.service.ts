import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from './post.model';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private posts: Post[] = [];

  //OBSERVABLE de type Subject (un observable jetable)
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  /*
    pipe puis rxjs map sur le flux de donnée
      sur le flux on fait un map classique
    pk on fait ça ? on a besoin d'avoir un observable a souscrire
  */
  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      .pipe(
        map((postData) => {
          return {
            posts: postData.posts.map((post: { _id: any; title: any; content: any; imagePath: any; }) => {
              return {
                id: post._id,
                title: post.title,
                content: post.content,
                imagePath: post.imagePath,
              };
            }),
            maxPosts: postData.maxPosts,
          };
        })
      )
      .subscribe((transformedPostData) => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: transformedPostData.maxPosts,
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    //pour eviter de manipuler par accident l'array de post je renvoi une copie avec le spread(...)
    //on retourne un objet avec le post qui a pour id l'id qu'on lui envoi en paramètre
    //return {...this.posts.find(p => p.id === id)}

    // on veut récupérer l'info direct depuis notre serveur
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
    }>('http://localhost:3000/api/posts/' + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData
      )
      .subscribe((responseData) => {
        this.navigateToAccueil();
      });
  }

  //méthode qui utilise le router service poru revenir à l'accueil
  navigateToAccueil() {
    this.router.navigate(['/']);
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    //si quand j'update j'ai une nouvelle image
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id), postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
      };
      // si quand j'update j'ai juste lien classique pour l'image
    }

    this.http
      .put<{ message: string; postId: string }>(
        'http://localhost:3000/api/posts/' + id,
        postData
      )
      .subscribe((response) => {
        this.navigateToAccueil();
      });
  }

  deletePost(postId: string) {
    return this.http
      .delete<{ postId: string }>('http://localhost:3000/api/posts/' + postId)
  }
}
