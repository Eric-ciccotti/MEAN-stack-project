import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from './post.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts: Post[] = [];

  //OBSERVABLE de type Subject (un observable jetable)
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  /*
    pipe puis rxjs map sur le flux de donnée
      sur le flux on fait un map classique
    pk on fait ça ? on a besoin d'avoir un observable a souscrire
  */
  getPosts() {
    this.http.get<{message: string, posts: any}>('http://localhost:3000/api/posts')
      .pipe(map((postData) => {
        return postData.posts.map((post: { _id: any; title: any; content: any; }) => {
          return {
            id: post._id,
            title : post.title,
            content: post.content
          }
        })
      }))
      .subscribe(transformedPosts => {
        this.posts = transformedPosts
        this.postsUpdated.next([...this.posts]);
      })
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    //pour eviter de manipuler par accident l'array de post je renvoi une copie avec le spread(...)
    //on retourne un objet avec le post qui a pour id l'id qu'on lui envoi en paramètre
    //return {...this.posts.find(p => p.id === id)}

    // on veut récupérer l'info direct depuis notre serveur
      return this.http.get<{_id: string, title: string, content: string}>("http://localhost:3000/api/posts/" + id)
  }

  addPost(title: string, content: string) {
    const post: Post = {id: null, title, content};
    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', post)
      .subscribe((responseData) => {
        //récuparation de l'id dans la bdd
        const id = responseData.postId;
        post.id = id;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      })
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = { id, title, content};
    this.http.put<{message: string, postId: string}>('http://localhost:3000/api/posts/' + id, post)
      .subscribe(response => {
        //copie de mes pots dans un tableau
        const updatedPosts = [...this.posts];
        //on veut l'index du vieux post = au post qu'on update
        const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
        // dans la copie de mon tableau je remplace le vieux post
        updatedPosts[oldPostIndex] = post;

        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      })
  }

  deletePost(postId: string) {
    this.http.delete<{postId: string}>("http://localhost:3000/api/posts/" + postId)
      .subscribe(() => {
        // je supprime dans l'array le post qui n'est pas égale à ce que j'ai en paramètre
        const updatedPosts = this.posts.filter(post => post.id !== postId)
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      })
  }
}